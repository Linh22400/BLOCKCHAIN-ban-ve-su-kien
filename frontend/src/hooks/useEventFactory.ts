/**
 * ═══════════════════════════════════════════════════════════════════
 * HOOKS: useEventFactory
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Mục đích: React hooks để tương tác với EventFactory smart contract
 * 
 * Sử dụng Wagmi hooks:
 * - useReadContract: Đọc data từ blockchain (view functions)
 * - useWriteContract: Gọi functions thay đổi state (transactions)
 * - useWaitForTransactionReceipt: Đợi transaction confirm
 * 
 * Hooks available:
 * 1. useGetAllEvents - Lấy tất cả events
 * 2. useGetOrganizerEvents - Lấy events của 1 organizer
 * 3. useCreateEvent - Tạo event mới
 * 4. useGetTotalEvents - Đếm tổng số events
 */

"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts/contracts';

// ═══════════════════════════════════════════════════════════════
// HOOK 1: Lấy Tất Cả Events
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để lấy danh sách TẤT CẢ events từ EventFactory
 * 
 * Sử dụng: Homepage để hiển thị tất cả events available
 * 
 * @returns {Object}
 * - eventAddresses: Mảng địa chỉ các EventTicket contracts
 * - isLoading: Đang load từ blockchain
 * - error: Lỗi nếu có
 * - refetch: Function để re-fetch data
 * 
 * @example
 * const { eventAddresses, isLoading } = useGetAllEvents();
 * if (isLoading) return <Loading />;
 * eventAddresses.map(addr => <EventCard address={addr} />)
 */
export function useGetAllEvents() {
    // useReadContract: Gọi view function, không tốn gas
    const { data: eventAddresses, isLoading, error, refetch } = useReadContract({
        address: CONTRACTS.EventFactory.address as `0x${string}`,
        abi: CONTRACTS.EventFactory.abi,
        functionName: 'getAllEvents', // Mapping tới getAllEvents() trong contract
    });

    return {
        eventAddresses: eventAddresses as string[] | undefined,
        isLoading,
        error,
        refetch, // Để refetch sau khi tạo event mới
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK 2: Lấy Events Của Organizer
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để lấy danh sách events của 1 organizer cụ thể
 * 
 * Sử dụng: Admin Dashboard để hiển thị "Events của tôi"
 * 
 * @param organizerAddress - Địa chỉ ví của organizer
 * 
 * @returns {Object}
 * - eventAddresses: Mảng địa chỉ events do organizer này tạo
 * - isLoading: Đang load
 * - error: Lỗi nếu có
 * 
 * @example
 * const { address } = useAccount(); // Lấy địa chỉ ví hiện tại
 * const { eventAddresses } = useGetOrganizerEvents(address);
 */
export function useGetOrganizerEvents(organizerAddress?: string) {
    const { data: eventAddresses, isLoading, error } = useReadContract({
        address: CONTRACTS.EventFactory.address as `0x${string}`,
        abi: CONTRACTS.EventFactory.abi,
        functionName: 'getOrganizerEvents',
        // Args chỉ pass khi có organizerAddress (conditional)
        args: organizerAddress ? [organizerAddress] : undefined,
    });

    return {
        eventAddresses: eventAddresses as string[] | undefined,
        isLoading,
        error,
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK 3: Tạo Event Mới
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để tạo event mới (deploy EventTicket contract)
 * 
 * Flow sử dụng:
 * 1. User điền form create event
 * 2. Click "Tạo Event"
 * 3. Gọi createEvent(params)
 * 4. MetaMask popup yêu cầu confirm transaction
 * 5. isPending = true (đang đợi user confirm)
 * 6. User confirm → transaction gửi lên blockchain
 * 7. isConfirming = true (đang đợi miners confirm)
 * 8. Miners confirm → isSuccess = true
 * 9. Show success message, redirect
 * 
 * @returns {Object}
 * - createEvent: Function để gọi create event
 * - hash: Transaction hash (để track trên Etherscan)
 * - isPending: Đang đợi user confirm trên MetaMask
 * - isConfirming: Đang đợi transaction confirm trên blockchain
 * - isSuccess: Transaction đã success
 * - error: Lỗi nếu có
 * 
 * @example
 * const { createEvent, isPending, isSuccess } = useCreateEvent();
 * 
 * const handleSubmit = () => {
 *   createEvent({
 *     name: "Concert Tickets",
 *     symbol: "CONCERT",
 *     eventName: "Sơn Tùng MTP Concert",
 *     eventDate: 1234567890,
 *     eventLocation: "Mỹ Đình Stadium",
 *     ticketPrice: parseEther("0.01"),
 *     maxResalePrice: parseEther("0.015"),
 *     royaltyPercentage: 500, // 5%
 *     totalTickets: 1000
 *   });
 * };
 * 
 * if (isPending) return <div>Đợi xác nhận...</div>;
 * if (isSuccess) return <div>Tạo thành công!</div>;
 */
export function useCreateEvent() {
    // useWriteContract: Ghi data lên blockchain (tốn gas)
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    // useWaitForTransactionReceipt: Đợi transaction được mine
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash, // Transaction hash từ writeContract
    });

    /**
     * Function tạo event
     * @param params - Object chứa thông tin event
     */
    const createEvent = (params: {
        name: string;              // Tên NFT collection
        symbol: string;            // Symbol NFT
        eventName: string;         // Tên sự kiện
        eventDate: number;         // Unix timestamp
        eventLocation: string;     // Địa điểm
        ticketPrice: bigint;       // Giá vé (wei)
        maxResalePrice: bigint;    // Giá tối đa resale (wei)
        royaltyPercentage: number; // % hoa hồng (basis points: 500 = 5%)
        totalTickets: number;      // Số lượng vé
    }) => {
        // Gọi createEvent function trong smart contract
        writeContract({
            address: CONTRACTS.EventFactory.address as `0x${string}`,
            abi: CONTRACTS.EventFactory.abi,
            functionName: 'createEvent',
            // Args theo đúng thứ tự trong contract function
            args: [
                params.name,
                params.symbol,
                params.eventName,
                BigInt(params.eventDate),      // Convert number → BigInt
                params.eventLocation,
                params.ticketPrice,             // Đã là BigInt
                params.maxResalePrice,          // Đã là BigInt
                params.royaltyPercentage,       // Number, contract sẽ nhận uint256
                params.totalTickets,            // Number → uint256
            ],
        });
    };

    return {
        createEvent,    // Function để gọi
        hash,           // Transaction hash
        isPending,      // Đang đợi user confirm
        isConfirming,   // Đang đợi blockchain confirm
        isSuccess,      // Đã thành công
        error,          // Lỗi nếu có
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK 4: Đếm Tổng Số Events
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để lấy tổng số events đã tạo
 * 
 * Sử dụng: Hiển thị statistics, pagination
 * 
 * @returns {Object}
 * - total: Tổng số events (number)
 * - isLoading: Đang load
 * - error: Lỗi nếu có
 * 
 * @example
 * const { total } = useGetTotalEvents();
 * return <p>Tổng số sự kiện: {total}</p>;
 */
export function useGetTotalEvents() {
    const { data: total, isLoading, error } = useReadContract({
        address: CONTRACTS.EventFactory.address as `0x${string}`,
        abi: CONTRACTS.EventFactory.abi,
        functionName: 'getTotalEvents',
    });

    return {
        total: total ? Number(total) : 0, // Convert BigInt → Number
        isLoading,
        error,
    };
}

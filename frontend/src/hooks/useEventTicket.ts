/**
 * ═══════════════════════════════════════════════════════════════════
 * HOOKS: useEventTicket
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Mục đích: React hooks để tương tác với EventTicket smart contract
 * 
 * Hooks available:
 * 1. useEventDetails - Lấy thông tin chi tiết event
 * 2. useMintTicket - Mua vé (primary sale)
 * 3. useListTicket - List vé lên marketplace  
 * 4. useUnlistTicket - Gỡ vé khỏi marketplace
 * 5. useBuyListedTicket - Mua vé từ marketplace (secondary sale)
 * 6. useTicketPrice - Lấy giá vé đang bán
 * 7. useIsTicketValid - Check vé có hợp lệ không
 * 8. useMarkTicketUsed - Check-in vé (organizer only)
 */

"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts/contracts';

// ═══════════════════════════════════════════════════════════════
// HOOK 1: Lấy Chi Tiết Event
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để lấy tất cả thông tin chi tiết của 1 event
 * 
 * Sử dụng: Event Details Page, Event Card
 * 
 * Performance: Multiple useReadContract calls song song
 * - Mỗi call lấy 1 property riêng
 * - Wagmi tự động batch và cache
 * 
 * @param eventAddress - Địa chỉ EventTicket contract
 * 
 * @returns {Object}
 * - eventName: Tên sự kiện
 * - eventDate: Timestamp (Unix)
 * - eventLocation: Địa điểm
 * - ticketPrice: Giá vé gốc (bigint wei)
 * - maxResalePrice: Giá tối đa resale (bigint wei)
 * - totalTickets: Tổng số vé
 * - totalMinted: Số vé đã bán
 * 
 * @example
 * const { eventName, ticketPrice, totalMinted } = useEventDetails(address);
 * console.log(`${eventName}: ${formatEther(ticketPrice)} ETH`);
 * console.log(`Đã bán: ${totalMinted}/${totalTickets}`);
 */
export function useEventDetails(eventAddress?: string) {
    // Read eventName từ contract
    const { data: eventName } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'eventName',
    });

    // Read eventDate (timestamp)
    const { data: eventDate } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'eventDate',
    });

    // Read eventLocation
    const { data: eventLocation } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'eventLocation',
    });

    // Read ticketPrice (giá vé gốc)
    const { data: ticketPrice } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'ticketPrice',
    });

    // Read maxResalePrice (giá ceiling)
    const { data: maxResalePrice } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'maxResalePrice',
    });

    // Read totalTickets (capacity)
    const { data: totalTickets } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'totalTickets',
    });

    // Read totalMinted (số vé đã bán)
    const { data: totalMinted } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'totalMinted',
    });

    return {
        eventName: eventName as string | undefined,
        eventDate: eventDate ? Number(eventDate) : undefined,
        eventLocation: eventLocation as string | undefined,
        ticketPrice: ticketPrice as bigint | undefined,
        maxResalePrice: maxResalePrice as bigint | undefined,
        totalTickets: totalTickets ? Number(totalTickets) : undefined,
        totalMinted: totalMinted ? Number(totalMinted) : undefined,
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK 2: Mua Vé (Primary Sale)
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để mua vé mới từ organizer (primary sale)
 * 
 * Flow mua vé:
 * 1. User click "Mua Vé"
 * 2. Gọi mintTicket({ to, tokenURI, price })
 * 3. MetaMask popup → user confirm
 * 4. isPending = true
 * 5. Transaction sent → isConfirming = true
 * 6. Mined → isSuccess = true
 * 7. Show success, NFT xuất hiện trong wallet
 * 
 * @param eventAddress - Địa chỉ event contract
 * 
 * @returns {Object}
 * - mintTicket: Function để mua vé
 * - hash: Transaction hash
 * - isPending: Đang đợi user confirm
 * - isConfirming: Đang đợi blockchain confirm
 * - isSuccess: Đã thành công
 * - error: Lỗi nếu có
 * 
 * @example
 * const { mintTicket, isPending, isSuccess } = useMintTicket(eventAddr);
 * const handleBuy = () => {
 *   mintTicket({
 *     to: address,                    // Địa chỉ nhận vé
 *     tokenURI: "ipfs://...",        // Metadata JSON
 *     price: parseEther("0.01")      // Giá vé
 *   });
 * };
 */
export function useMintTicket(eventAddress?: string) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    /**
     * Function mua vé
     * @param params.to - Địa chỉ nhận vé (thường là user address)
     * @param params.tokenURI - URI metadata của vé
     * @param params.price - Giá vé (wei) - phải >= ticketPrice
     */
    const mintTicket = (params: {
        to: string;
        tokenURI: string;
        price: bigint; // In wei
    }) => {
        if (!eventAddress) return;

        writeContract({
            address: eventAddress as `0x${string}`,
            abi: CONTRACTS.EventTicket.abi,
            functionName: 'mintTicket',
            args: [params.to, params.tokenURI],
            value: params.price, // Gửi ETH kèm theo (payable function)
        });
    };

    return {
        mintTicket,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK 3: Lấy Giá Vé Đang Bán
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để lấy giá vé đang bán trên marketplace
 * 
 * @param eventAddress - Địa chỉ event contract
 * @param tokenId - ID của vé
 * 
 * @returns {Object}
 * - price: Giá đang bán (bigint wei) - 0 = không bán
 * - refetch: Function để refetch giá
 * 
 * @example
 * const { price } = useTicketPrice(eventAddr, 5);
 * if (price > 0) {
 *   console.log("Vé đang bán:", formatEther(price), "ETH");
 * } else {
 *   console.log("Vé không bán");
 * }
 */
export function useTicketPrice(eventAddress?: string, tokenId?: number) {
    const { data: price, refetch } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'ticketPrices',
        args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
    });

    return {
        price: price as bigint | undefined,
        refetch,
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK 4: List Vé Lên Marketplace
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để list vé lên marketplace
 * 
 * Requirements:
 * - Phải là owner của vé
 * - Vé chưa sử dụng
 * - Giá <= maxResalePrice (anti-scalping)
 * 
 * @param eventAddress - Địa chỉ event contract
 * 
 * @returns {Object}
 * - listTicket: Function để list vé
 * - hash, isPending, isConfirming, isSuccess, error
 * 
 * @example
 * const { listTicket, isSuccess } = useListTicket(eventAddr);
 * const handleList = () => {
 *   listTicket({
 *     tokenId: 5,
 *     price: parseEther("0.015") // Giá muốn bán
 *   });
 * };
 */
export function useListTicket(eventAddress?: string) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    /**
     * Function list vé
     * @param params.tokenId - ID vé muốn bán
     * @param params.price - Giá bán (wei) - phải <= maxResalePrice
     */
    const listTicket = (params: {
        tokenId: number;
        price: bigint; // In wei
    }) => {
        if (!eventAddress) return;

        writeContract({
            address: eventAddress as `0x${string}`,
            abi: CONTRACTS.EventTicket.abi,
            functionName: 'listTicket',
            args: [BigInt(params.tokenId), params.price],
        });
    };

    return {
        listTicket,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK 5: Gỡ Vé Khỏi Marketplace
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để gỡ vé khỏi marketplace (cancel listing)
 * 
 * @param eventAddress - Địa chỉ event contract
 * 
 * @returns {Object}
 * - unlistTicket: Function để gỡ vé
 * - hash, isPending, isConfirming, isSuccess, error
 * 
 * @example
 * const { unlistTicket } = useUnlistTicket(eventAddr);
 * const handleUnlist = () => {
 *   unlistTicket(5); // Gỡ vé #5
 * };
 */
export function useUnlistTicket(eventAddress?: string) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    /**
     * Function gỡ vé
     * @param tokenId - ID vé muốn gỡ
     */
    const unlistTicket = (tokenId: number) => {
        if (!eventAddress) return;

        writeContract({
            address: eventAddress as `0x${string}`,
            abi: CONTRACTS.EventTicket.abi,
            functionName: 'unlistTicket',
            args: [BigInt(tokenId)],
        });
    };

    return {
        unlistTicket,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK 6: Mua Vé Từ Marketplace (Secondary Sale)
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để mua vé từ marketplace (secondary sale)
 * 
 * Flow mua vé đã qua tay:
 * 1. User thấy vé trên marketplace
 * 2. Click "Mua Vé Này"
 * 3. Gọi buyListedTicket({ tokenId, price })
 * 4. Smart contract auto tính royalty cho organizer
 * 5. Chuyển tiền cho seller
 * 6. Transfer NFT cho buyer
 * 
 * Payment Distribution:
 * - Royalty → Organizer (owner of contract)
 * - Remaining → Seller
 * 
 * @param eventAddress - Địa chỉ event contract
 * 
 * @returns {Object}
 * - buyListedTicket: Function để mua vé
 * - hash, isPending, isConfirming, isSuccess, error
 * 
 * @example
 * const { buyListedTicket } = useBuyListedTicket(eventAddr);
 * const handleBuy = () => {
 *   buyListedTicket({
 *     tokenId: 5,
 *     price: parseEther("0.015") // Giá vé
 *   });
 * };
 */
export function useBuyListedTicket(eventAddress?: string) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    /**
     * Function mua vé từ marketplace
     * @param params.tokenId - ID vé muốn mua
     * @param params.price - Giá vé (wei)
     */
    const buyListedTicket = (params: {
        tokenId: number;
        price: bigint; // In wei
    }) => {
        if (!eventAddress) return;

        writeContract({
            address: eventAddress as `0x${string}`,
            abi: CONTRACTS.EventTicket.abi,
            functionName: 'buyListedTicket',
            args: [BigInt(params.tokenId)],
            value: params.price, // Gửi ETH để mua vé
        });
    };

    return {
        buyListedTicket,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK 7: Check Vé Hợp Lệ
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để kiểm tra vé có hợp lệ để vào event không
 * 
 * Vé hợp lệ khi:
 * 1. User là owner hiện tại của vé
 * 2. Vé chưa được sử dụng (check-in)
 * 
 * Sử dụng: Check-in Page, QR Scanner
 * 
 * @param eventAddress - Địa chỉ event contract
 * @param tokenId - ID vé cần check
 * @param userAddress - Địa chỉ người giữ vé
 * 
 * @returns {Object}
 * - isValid: true = hợp lệ, false = không hợp lệ
 * - isLoading: Đang check
 * - error: Lỗi nếu có
 * - refetch: Function để check lại
 * 
 * @example
 * const { isValid, refetch } = useIsTicketValid(
 *   eventAddr,
 *   tokenId,
 *   userAddr
 * );
 * if (isValid) {
 *   console.log("✅ Vào được!");
 * } else {
 *   console.log("❌ Không hợp lệ");
 * }
 */
export function useIsTicketValid(eventAddress?: string, tokenId?: number, userAddress?: string) {
    const { data: isValid, isLoading, error, refetch } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'isTicketValid',
        args: tokenId !== undefined && userAddress ? [BigInt(tokenId), userAddress] : undefined,
    });

    return {
        isValid: isValid as boolean | undefined,
        isLoading,
        error,
        refetch,
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK 8: Check-in Vé (Organizer Only)
// ═══════════════════════════════════════════════════════════════

/**
 * Hook để check-in vé tại sự kiện
 * 
 * Requirements:
 * - Chỉ organizer (owner of contract) mới gọi được
 * - Vé chưa được sử dụng
 * 
 * Flow check-in:
 * 1. Organizer scan QR code vé
 * 2. Get tokenId từ QR
 * 3. Check isTicketValid trước
 * 4. Nếu valid → gọi markTicketUsed(tokenId)
 * 5. Vé được đánh dấu đã dùng
 * 6. Không thể vào event lần 2
 * 
 * @param eventAddress - Địa chỉ event contract
 * 
 * @returns {Object}
 * - markTicketUsed: Function để check-in
 * - hash, isPending, isConfirming, isSuccess, error
 * 
 * @example
 * const { markTicketUsed, isSuccess } = useMarkTicketUsed(eventAddr);
 * const handleCheckIn = async (tokenId: number) => {
 *   // Validate first
 *   const valid = await isTicketValid(tokenId, userAddr);
 *   if (!valid) {
 *     toast.error("Vé không hợp lệ!");
 *     return;
 *   }
 *   // Check-in
 *   markTicketUsed(tokenId);
 * };
 */
export function useMarkTicketUsed(eventAddress?: string) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    /**
     * Function check-in vé
     * @param tokenId - ID vé cần check-in
     */
    const markTicketUsed = (tokenId: number) => {
        if (!eventAddress) return;

        writeContract({
            address: eventAddress as `0x${string}`,
            abi: CONTRACTS.EventTicket.abi,
            functionName: 'markTicketUsed',
            args: [BigInt(tokenId)],
        });
    };

    return {
        markTicketUsed,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * UTILITY: Lấy Tất Cả Vé Đang Bán
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Mục đích: Fetch tất cả vé đang được list lên marketplace
 * 
 * Cách hoạt động:
 * 1. Loop qua tất cả events
 * 2. Với mỗi event, get totalMinted
 * 3. Check giá bán của từng vé (multicall)
 * 4. Nếu price > 0 → vé đang bán
 * 5. Lấy thêm owner của vé
 * 6. Aggregate tất cả vé đang bán
 * 
 * Performance:
 * - Sử dụng multicall để batch requests
 * - Parallel fetch cho nhiều events
 * 
 * Use Case: Marketplace Page - hiển thị tất cả vé có thể mua
 */

import { createPublicClient, http, parseAbi } from 'viem';
import { NETWORK_CONFIG } from '../contracts/contracts';
import { sepolia } from 'viem/chains';

// Tạo public client để đọc data từ blockchain
const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(NETWORK_CONFIG.rpcUrl),
});

// Định nghĩa ABI các functions cần gọi
const ABI = parseAbi([
    'function totalMinted() view returns (uint256)',      // Tổng số vé đã mint
    'function ticketPrices(uint256 tokenId) view returns (uint256)',  // Giá vé (0 = không bán)
    'function eventName() view returns (string)',         // Tên sự kiện
    'function ownerOf(uint256 tokenId) view returns (address)'  // Chủ sở hữu vé
]);

// Interface định nghĩa cấu trúc data của 1 vé đang bán
export interface ListedTicket {
    eventAddress: string;   // Địa chỉ event contract
    eventName: string;      // Tên sự kiện (để hiển thị)
    tokenId: number;        // ID của vé
    price: bigint;          // Giá đang bán (wei) - luôn > 0
    owner: string;          // Địa chỉ người bán
}

/**
 * Hàm chính: Lấy tất cả vé đang bán từ tất cả events
 * 
 * @param eventAddresses - Mảng địa chỉ các event contracts
 * @returns Mảng ListedTicket[] - Tất cả vé đang bán
 * 
 * @example
 * const { eventAddresses } = useGetAllEvents();
 * const listedTickets = await fetchAllListedTickets(eventAddresses);
 * // [{tokenId: 5, price: 0.015 ETH, owner: "0x...", ...}, ...]
 * 
 * // Display on marketplace
 * listedTickets.map(ticket => (
 *   <TicketCard
 *     eventName={ticket.eventName}
 *     price={formatEther(ticket.price)}
 *     onBuy={() => buyTicket(ticket.tokenId, ticket.price)}
 *   />
 * ))
 */
export async function fetchAllListedTickets(eventAddresses: string[]) {
    try {
        const listedTickets: ListedTicket[] = [];

        // ==========================================
        // LOOP QUA TỪNG EVENT
        // ==========================================
        for (const eventAddress of eventAddresses) {
            // ==========================================
            // BƯỚC 1: Lấy thông tin cơ bản của event
            // ==========================================
            // Fetch song song: totalMinted + eventName
            const [totalMinted, eventName] = await Promise.all([
                publicClient.readContract({
                    address: eventAddress as `0x${string}`,
                    abi: ABI,
                    functionName: 'totalMinted',
                }) as Promise<bigint>,
                publicClient.readContract({
                    address: eventAddress as `0x${string}`,
                    abi: ABI,
                    functionName: 'eventName',
                }) as Promise<string>
            ]);

            const total = Number(totalMinted);

            // Nếu chưa có vé nào → skip event này
            if (total === 0) continue;

            // ==========================================
            // BƯỚC 2: Multicall lấy giá của tất cả vé
            // ==========================================
            // Chuẩn bị calls để lấy ticketPrices
            const calls = [];
            for (let i = 0; i < total; i++) {
                calls.push({
                    address: eventAddress as `0x${string}`,
                    abi: ABI,
                    functionName: 'ticketPrices',
                    args: [BigInt(i)],
                });
            }

            // Execute multicall - lấy giá tất cả vé cùng lúc
            const priceResults = await publicClient.multicall({ contracts: calls });

            // ==========================================
            // BƯỚC 3: Filter vé đang bán (price > 0)
            // ==========================================
            const listedIndices: number[] = [];
            priceResults.forEach((res, index) => {
                // Nếu price > 0 → vé đang bán
                if (res.status === 'success' && (res.result as bigint) > BigInt(0)) {
                    listedIndices.push(index);
                }
            });

            // Nếu không có vé nào đang bán → skip
            if (listedIndices.length === 0) continue;

            // ==========================================
            // BƯỚC 4: Lấy owner của các vé đang bán
            // ==========================================
            // Multicall để lấy owner
            const ownerCalls = listedIndices.map(idx => ({
                address: eventAddress as `0x${string}`,
                abi: ABI,
                functionName: 'ownerOf',
                args: [BigInt(idx)],
            }));

            const ownerResults = await publicClient.multicall({ contracts: ownerCalls });

            // ==========================================
            // BƯỚC 5: Aggregate data
            // ==========================================
            // Kết hợp thông tin: tokenId, price, owner, eventName
            listedIndices.forEach((tokenId, i) => {
                const ownerRes = ownerResults[i];
                if (ownerRes.status === 'success') {
                    listedTickets.push({
                        eventAddress,
                        eventName,                                      // Tên sự kiện
                        tokenId,                                       // ID vé
                        price: priceResults[tokenId].result as bigint, // Giá bán
                        owner: ownerRes.result as string               // Người bán
                    });
                }
            });
        }

        // Return tất cả vé đang bán
        return listedTickets;

    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách vé đang bán:", error);
        return []; // Return empty array thay vì throw
    }
}

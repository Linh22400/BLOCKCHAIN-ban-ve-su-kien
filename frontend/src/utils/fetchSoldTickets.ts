/**
 * ═══════════════════════════════════════════════════════════════════
 * UTILITY: Lấy Lịch Sử Vé Đã Bán
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Mục đích: Fetch lịch sử vé mà user đã bán thành công
 * 
 * Cách hoạt động:
 * 1. Query blockchain logs tìm TicketSold events
 * 2. Filter events với from=userAddress (seller)
 * 3. Extract thông tin: tokenId, price, buyer, transaction hash
 * 4. Sort theo block number (newest first)
 * 
 * Performance:
 * - Query logs chỉ trong 50k blocks gần nhất (giảm load RPC)
 * - Sử dụng indexed parameters để filter nhanh
 * 
 * Use Case: "My Tickets" page - tab "Đã Bán" 
 */

import { createPublicClient, http, parseAbi } from 'viem';
import { NETWORK_CONFIG } from '../contracts/contracts';
import { sepolia } from 'viem/chains';

// Tạo public client để đọc data và events
const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(NETWORK_CONFIG.rpcUrl),
});

// Định nghĩa event TicketSold để query logs  
// Event này được emit khi vé được bán thành công trên marketplace
const EVENT_ABI = parseAbi([
    'event TicketSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price)'
]);

// Interface định nghĩa cấu trúc data của 1 vé đã bán
export interface SoldTicket {
    eventAddress: string;       // Địa chỉ event contract
    tokenId: number;           // ID của vé đã bán
    price: bigint;             // Giá bán được (wei)
    buyer: string;             // Địa chỉ người mua
    transactionHash: string;   // Hash của transaction (để xem trên Etherscan)
    blockNumber: bigint;       // Block number (để sort theo thời gian)
}

/**
 * Hàm chính: Lấy lịch sử vé đã bán của user
 * 
 * @param eventAddresses - Mảng địa chỉ các event contracts cần query
 * @param userAddress - Địa chỉ seller (user đã bán vé)
 * @returns Mảng SoldTicket[] sorted theo thời gian (newest first)
 * 
 * @example
 * const { eventAddresses } = useGetAllEvents();
 * const soldTickets = await fetchSoldTickets(eventAddresses, userAddress);
 * // [{tokenId: 5, price: 0.015 ETH, buyer: "0x...", ...}, ...]
 */
export async function fetchSoldTickets(eventAddresses: string[], userAddress: string) {
    const soldTickets: SoldTicket[] = [];

    try {
        // ==========================================
        // BƯỚC 1: Get current block để tính range
        // ==========================================
        const currentBlock = await publicClient.getBlockNumber();

        // Query 50k blocks gần nhất
        // (publicnode.com có giới hạn range)
        const fromBlock = currentBlock > BigInt(50000)
            ? currentBlock - BigInt(50000)
            : BigInt(0);

        // ==========================================
        // BƯỚC 2: Query logs cho từng event
        // ==========================================
        for (const eventAddress of eventAddresses) {
            // Get logs của TicketSold event
            // Filter: from = userAddress (chỉ lấy vé user đã bán)
            const logs = await publicClient.getLogs({
                address: eventAddress as `0x${string}`,
                event: EVENT_ABI[0],
                args: {
                    from: userAddress as `0x${string}` // Filter theo seller
                },
                fromBlock: fromBlock, // Chỉ query 50k blocks gần nhất
                toBlock: currentBlock
            });

            // ==========================================
            // BƯỚC 3: Extract data từ logs
            // ==========================================
            for (const log of logs) {
                soldTickets.push({
                    eventAddress,
                    tokenId: Number(log.args.tokenId),          // Convert BigInt → Number
                    price: log.args.price || BigInt(0),         // Giá bán được
                    buyer: log.args.to || '0x0',                // Người mua
                    transactionHash: log.transactionHash,       // TX hash
                    blockNumber: log.blockNumber                // Block number (để sort)
                });
            }
        }

        // ==========================================
        // BƯỚC 4: Sort theo block number (newest first)
        // ==========================================
        // Block number càng cao = càng mới
        return soldTickets.sort((a, b) => Number(b.blockNumber - a.blockNumber));

    } catch (error) {
        console.error("❌ Lỗi khi lấy lịch sử vé đã bán:", error);
        return []; // Return empty array thay vì throw error
    }
}

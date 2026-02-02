/**
 * =================================================================
 * UTILITY: Lấy Danh Sách Vé Của User
 * =================================================================
 * 
 * Chức năng: Fetch tất cả vé NFT mà user sở hữu từ một event cụ thể
 * 
 * Cách hoạt động:
 * 1. Lấy tổng số vé đã mint cho event
 * 2. Dùng multicall để kiểm tra owner của từng vé
 * 3. Lọc ra những vé thuộc về user
 * 4. Lấy giá bán và trạng thái đã sử dụng của vé
 * 
 * Performance: Sử dụng multicall để gộp nhiều RPC calls thành 1 request
 * → Giảm thời gian load từ ~10s xuống ~1s
 */

import { createPublicClient, http, parseAbi } from 'viem';
import { NETWORK_CONFIG } from '../contracts/contracts';
import { sepolia } from 'viem/chains';

// Tạo public client để đọc data từ blockchain
// Không cần private key vì chỉ đọc, không ghi
const publicClient = createPublicClient({
    chain: sepolia, // Sepolia testnet
    transport: http(NETWORK_CONFIG.rpcUrl), // RPC URL từ config
});

// Định nghĩa ABI (Application Binary Interface) - các function cần gọi
// Chỉ cần khai báo function signatures, không cần toàn bộ ABI
const ABI = parseAbi([
    'function totalMinted() view returns (uint256)',      // Tổng số vé đã mint
    'function ownerOf(uint256 tokenId) view returns (address)',  // Chủ sở hữu vé
    'function ticketPrices(uint256 tokenId) view returns (uint256)',  // Giá bán vé (0 = chưa bán)
    'function ticketUsed(uint256 tokenId) view returns (bool)'  // Vé đã check-in chưa
]);

// Interface định nghĩa cấu trúc dữ liệu của 1 vé
export interface UserTicket {
    tokenId: number;    // ID của vé NFT
    price: bigint;      // Giá đang bán (0 = không bán)
    isUsed: boolean;    // Đã check-in chưa (true = đã dùng)
}

/**
 * Hàm chính: Lấy tất cả vé của user từ 1 event
 * 
 * @param eventAddress - Địa chỉ contract của event
 * @param userAddress - Địa chỉ ví của user
 * @returns Mảng UserTicket[] - Danh sách vé của user
 */
export async function fetchUserTickets(eventAddress: string, userAddress: string): Promise<UserTicket[]> {
    try {
        // ==========================================
        // BƯỚC 1: Lấy tổng số vé đã mint
        // ==========================================
        const totalMinted = await publicClient.readContract({
            address: eventAddress as `0x${string}`,
            abi: ABI,
            functionName: 'totalMinted',
        }) as bigint;

        const total = Number(totalMinted);

        // Nếu chưa có vé nào được mint → return mảng rỗng
        if (total === 0) return [];

        // ==========================================
        // BƯỚC 2: Chuẩn bị multicall
        // ==========================================
        // Với mỗi vé, cần lấy 3 thông tin:
        // 1. Owner (chủ sở hữu)
        // 2. Price (giá bán)
        // 3. IsUsed (đã sử dụng)

        const calls = [];
        for (let i = 0; i < total; i++) {
            // Call 1: Lấy owner của vé #i
            calls.push({
                address: eventAddress as `0x${string}`,
                abi: ABI,
                functionName: 'ownerOf',
                args: [BigInt(i)],
            });

            // Call 2: Lấy giá bán của vé #i
            calls.push({
                address: eventAddress as `0x${string}`,
                abi: ABI,
                functionName: 'ticketPrices',
                args: [BigInt(i)],
            });

            // Call 3: Kiểm tra vé #i đã sử dụng chưa
            calls.push({
                address: eventAddress as `0x${string}`,
                abi: ABI,
                functionName: 'ticketUsed',
                args: [BigInt(i)],
            });
        }

        // ==========================================
        // BƯỚC 3: Execute multicall
        // ==========================================
        // Gộp tất cả calls thành 1 request duy nhất
        // Thay vì gọi 3*total lần → Chỉ gọi 1 lần
        const results = await publicClient.multicall({
            contracts: calls,
        });

        const myTickets: UserTicket[] = [];

        // ==========================================
        // BƯỚC 4: Xử lý kết quả
        // ==========================================
        // Results có dạng: [owner0, price0, isUsed0, owner1, price1, isUsed1, ...]
        // Mỗi vé có 3 kết quả liên tiếp

        for (let i = 0; i < total; i++) {
            // Lấy 3 kết quả tương ứng với vé #i
            const ownerResult = results[i * 3];      // Kết quả ownerOf
            const priceResult = results[i * 3 + 1];  // Kết quả ticketPrices
            const isUsedResult = results[i * 3 + 2]; // Kết quả ticketUsed

            // Kiểm tra nếu vé này thuộc về user
            if (ownerResult.status === 'success' &&
                (ownerResult.result as unknown as string).toLowerCase() === userAddress.toLowerCase()) {

                // Tạo object ticket với đầy đủ thông tin
                const ticketData: UserTicket = {
                    tokenId: i,
                    // Nếu lấy giá thành công → dùng giá đó, không thì = 0
                    price: priceResult.status === 'success' ? (priceResult.result as bigint) : BigInt(0),
                    // Nếu lấy isUsed thành công → convert sang boolean, không thì = false
                    isUsed: isUsedResult.status === 'success' ? Boolean(isUsedResult.result) : false
                };

                // Debug log để kiểm tra (có thể xóa khi production)
                console.log(`🎫 Ticket #${i}:`, {
                    price: ticketData.price.toString(),
                    isUsed: ticketData.isUsed,
                    isUsedRaw: isUsedResult.result
                });

                // Thêm vé vào danh sách
                myTickets.push(ticketData);
            }
        }

        // Trả về danh sách vé của user
        return myTickets;

    } catch (error) {
        // Log lỗi nếu có vấn đề khi fetch
        console.error("❌ Lỗi khi lấy danh sách vé của user:", error);
        return []; // Trả về mảng rỗng thay vì throw error
    }
}

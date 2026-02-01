import { createPublicClient, http, parseAbi } from 'viem';
import { NETWORK_CONFIG, CONTRACTS } from '../contracts/contracts';
import { sepolia } from 'viem/chains';

const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(NETWORK_CONFIG.rpcUrl),
});

const ABI = parseAbi([
    'function totalMinted() view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function ticketPrices(uint256 tokenId) view returns (uint256)',
    'function ticketUsed(uint256 tokenId) view returns (bool)' // ✅ Correct function name
]);

export interface UserTicket {
    tokenId: number;
    price: bigint;
    isUsed: boolean;
}

export async function fetchUserTickets(eventAddress: string, userAddress: string): Promise<UserTicket[]> {
    try {
        // 1. Get total minted
        const totalMinted = await publicClient.readContract({
            address: eventAddress as `0x${string}`,
            abi: ABI,
            functionName: 'totalMinted',
        }) as bigint;

        const total = Number(totalMinted);
        if (total === 0) return [];

        // 2. Prepare multicall to get owners, prices, and used status
        const calls = [];
        for (let i = 0; i < total; i++) {
            calls.push({
                address: eventAddress as `0x${string}`,
                abi: ABI,
                functionName: 'ownerOf',
                args: [BigInt(i)],
            });
            calls.push({
                address: eventAddress as `0x${string}`,
                abi: ABI,
                functionName: 'ticketPrices',
                args: [BigInt(i)],
            });
            calls.push({
                address: eventAddress as `0x${string}`,
                abi: ABI,
                functionName: 'ticketUsed', // ✅ Correct function name
                args: [BigInt(i)],
            });
        }

        // 3. Execute multicall
        const results = await publicClient.multicall({
            contracts: calls,
        });

        const myTickets: UserTicket[] = [];

        // 4. Process results
        // Results form: [owner0, price0, isUsed0, owner1, price1, isUsed1, ...]
        for (let i = 0; i < total; i++) {
            const ownerResult = results[i * 3];
            const priceResult = results[i * 3 + 1];
            const isUsedResult = results[i * 3 + 2];

            if (ownerResult.status === 'success' &&
                (ownerResult.result as unknown as string).toLowerCase() === userAddress.toLowerCase()) {

                const ticketData: UserTicket = {
                    tokenId: i,
                    price: priceResult.status === 'success' ? (priceResult.result as bigint) : BigInt(0),
                    isUsed: isUsedResult.status === 'success' ? Boolean(isUsedResult.result) : false
                };

                console.log(`🎫 Ticket #${i}:`, {
                    price: ticketData.price.toString(),
                    isUsed: ticketData.isUsed,
                    isUsedRaw: isUsedResult.result
                });

                myTickets.push(ticketData);
            }
        }

        return myTickets;

    } catch (error) {
        console.error("Error fetching user tickets:", error);
        return [];
    }
}

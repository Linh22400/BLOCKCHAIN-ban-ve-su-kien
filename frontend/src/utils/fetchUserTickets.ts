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
    'function ticketPrices(uint256 tokenId) view returns (uint256)'
]);

export async function fetchUserTickets(eventAddress: string, userAddress: string) {
    try {
        // 1. Get total minted
        const totalMinted = await publicClient.readContract({
            address: eventAddress as `0x${string}`,
            abi: ABI,
            functionName: 'totalMinted',
        }) as bigint;

        const total = Number(totalMinted);
        if (total === 0) return [];

        // 2. Prepare multicall to get owners and prices
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
        }

        // 3. Execute multicall
        // Note: publicClient.multicall is available in viem.
        const results = await publicClient.multicall({
            contracts: calls,
        });

        const myTickets: { tokenId: number; price: bigint }[] = [];

        // 4. Process results
        // Results form: [owner0, price0, owner1, price1, ...]
        for (let i = 0; i < total; i++) {
            const ownerResult = results[i * 2];
            const priceResult = results[i * 2 + 1];

            if (ownerResult.status === 'success' &&
                (ownerResult.result as unknown as string).toLowerCase() === userAddress.toLowerCase()) {

                myTickets.push({
                    tokenId: i,
                    price: priceResult.status === 'success' ? (priceResult.result as bigint) : BigInt(0)
                });
            }
        }

        return myTickets;

    } catch (error) {
        console.error("Error fetching user tickets:", error);
        return [];
    }
}

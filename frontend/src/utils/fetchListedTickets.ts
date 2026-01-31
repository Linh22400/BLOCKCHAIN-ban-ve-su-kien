import { createPublicClient, http, parseAbi, formatEther } from 'viem';
import { NETWORK_CONFIG } from '../contracts/contracts';
import { sepolia } from 'viem/chains';

const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(NETWORK_CONFIG.rpcUrl),
});

const ABI = parseAbi([
    'function totalMinted() view returns (uint256)',
    'function ticketPrices(uint256 tokenId) view returns (uint256)',
    'function eventName() view returns (string)',
    'function ownerOf(uint256 tokenId) view returns (address)'
]);

export interface ListedTicket {
    eventAddress: string;
    eventName: string;
    tokenId: number;
    price: bigint;
    owner: string;
}

export async function fetchAllListedTickets(eventAddresses: string[]) {
    try {
        const listedTickets: ListedTicket[] = [];

        for (const eventAddress of eventAddresses) {
            // 1. Get details
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
            if (total === 0) continue;

            // 2. Multicall for prices
            const calls = [];
            for (let i = 0; i < total; i++) {
                calls.push({
                    address: eventAddress as `0x${string}`,
                    abi: ABI,
                    functionName: 'ticketPrices',
                    args: [BigInt(i)],
                });
            }

            const priceResults = await publicClient.multicall({ contracts: calls });

            // 3. Find listed tickets
            const listedIndices: number[] = [];
            priceResults.forEach((res, index) => {
                if (res.status === 'success' && (res.result as bigint) > BigInt(0)) {
                    listedIndices.push(index);
                }
            });

            if (listedIndices.length === 0) continue;

            // 4. Get owners for listed tickets
            const ownerCalls = listedIndices.map(idx => ({
                address: eventAddress as `0x${string}`,
                abi: ABI,
                functionName: 'ownerOf',
                args: [BigInt(idx)],
            }));

            const ownerResults = await publicClient.multicall({ contracts: ownerCalls });

            // 5. Aggregate
            listedIndices.forEach((tokenId, i) => {
                const ownerRes = ownerResults[i];
                if (ownerRes.status === 'success') {
                    listedTickets.push({
                        eventAddress,
                        eventName,
                        tokenId,
                        price: priceResults[tokenId].result as bigint,
                        owner: ownerRes.result as string
                    });
                }
            });
        }

        return listedTickets;

    } catch (error) {
        console.error("Error fetching listed tickets:", error);
        return [];
    }
}

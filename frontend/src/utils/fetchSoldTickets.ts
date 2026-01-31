import { createPublicClient, http, parseAbi, formatEther } from 'viem';
import { NETWORK_CONFIG } from '../contracts/contracts';
import { sepolia } from 'viem/chains';

const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(NETWORK_CONFIG.rpcUrl),
});

const EVENT_ABI = parseAbi([
    'event TicketSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price)'
]);

export interface SoldTicket {
    eventAddress: string;
    tokenId: number;
    price: bigint;
    buyer: string;
    transactionHash: string;
    blockNumber: bigint;
}

export async function fetchSoldTickets(eventAddresses: string[], userAddress: string) {
    const soldTickets: SoldTicket[] = [];

    // console.log("Fetching sold tickets for user:", userAddress);

    try {
        for (const eventAddress of eventAddresses) {
            const logs = await publicClient.getLogs({
                address: eventAddress as `0x${string}`,
                event: EVENT_ABI[0],
                args: {
                    from: userAddress as `0x${string}`
                },
                fromBlock: 'earliest'
            });

            // console.log(`Found ${logs.length} sold logs for event ${eventAddress}`);

            for (const log of logs) {
                soldTickets.push({
                    eventAddress,
                    tokenId: Number(log.args.tokenId),
                    price: log.args.price || BigInt(0),
                    buyer: log.args.to || '0x0',
                    transactionHash: log.transactionHash,
                    blockNumber: log.blockNumber
                });
            }
        }

        // Sort by block number descending (newest first)
        return soldTickets.sort((a, b) => Number(b.blockNumber - a.blockNumber));

    } catch (error) {
        console.error("Error fetching sold tickets:", error);
        return [];
    }
}

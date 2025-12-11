"use client"

import { useAccount } from "wagmi"
import { useGetAllEvents } from "@/hooks/useEventFactory"
import { useEventDetails } from "@/hooks/useEventTicket"
import { Calendar, MapPin, Ticket as TicketIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatEther } from "viem"
import { useReadContract } from "wagmi"
import { CONTRACTS } from "@/contracts/contracts"

// Helper hook to get NFT balance for an event
function useTicketBalance(eventAddress?: string, userAddress?: string) {
    const { data: balance } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'balanceOf',
        args: userAddress ? [userAddress] : undefined,
    })

    return balance ? Number(balance) : 0
}

// Component for individual ticket card
function TicketCard({ eventAddress, eventIndex }: { eventAddress: string; eventIndex: number }) {
    const { address } = useAccount()
    const { eventName, eventDate, eventLocation, ticketPrice } = useEventDetails(eventAddress)
    const balance = useTicketBalance(eventAddress, address)

    if (balance === 0) return null

    const formattedDate = eventDate
        ? new Date(eventDate * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'TBA'

    const formattedPrice = ticketPrice ? formatEther(ticketPrice) : '0'

    return (
        <div className="bg-card border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <TicketIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{eventName}</h3>
                            <p className="text-sm text-muted-foreground">
                                {balance} ticket{balance > 1 ? 's' : ''} owned
                            </p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-lg font-bold text-primary">{formattedPrice} ETH</p>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{eventLocation || 'TBA'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TicketIcon className="h-4 w-4" />
                    <span className="font-mono text-xs">{eventAddress.slice(0, 6)}...{eventAddress.slice(-4)}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`/events/${eventIndex}`, '_blank')}
                >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Event
                </Button>
                <Button
                    variant="secondary"
                    className="flex-1"
                    disabled
                >
                    Transfer
                </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-center text-muted-foreground">
                    NFT Ticket • Stored in your wallet
                </p>
            </div>
        </div>
    )
}

export default function MyTicketsPage() {
    const { address, isConnected } = useAccount()
    const { eventAddresses, isLoading } = useGetAllEvents()

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">My Tickets</h1>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-8 text-center">
                    <TicketIcon className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground">
                        Please connect your wallet to view your NFT tickets
                    </p>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">My Tickets</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-64 bg-card border border-white/10 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
                <p className="text-muted-foreground">
                    Your NFT tickets across all events
                </p>
            </div>

            {(!eventAddresses || eventAddresses.length === 0) ? (
                <div className="text-center py-12">
                    <TicketIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-bold mb-2">No Events Yet</h3>
                    <p className="text-muted-foreground">
                        No events have been created yet
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {eventAddresses.map((address, index) => (
                        <TicketCard
                            key={address}
                            eventAddress={address}
                            eventIndex={index}
                        />
                    ))}
                </div>
            )}

            <div className="mt-8 bg-card border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2">💡 About NFT Tickets</h3>
                <p className="text-sm text-muted-foreground">
                    Your tickets are ERC-721 NFTs stored directly in your wallet.
                    You can view them in MetaMask under the NFTs tab. Each ticket is a unique,
                    verifiable proof of ownership that cannot be counterfeited.
                </p>
            </div>
        </div>
    )
}

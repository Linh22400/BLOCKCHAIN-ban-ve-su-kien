"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Ticket, CheckCircle, XCircle } from "lucide-react"
import { useGetAllEvents } from "@/hooks/useEventFactory"
import { useEventDetails, useMintTicket } from "@/hooks/useEventTicket"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { useEffect } from "react"

export default function EventDetailsPage() {
    const params = useParams()
    const eventIndex = Number(params.id)
    const { address: userAddress, isConnected } = useAccount()

    // Get event address from factory
    const { eventAddresses, isLoading: loadingAddresses } = useGetAllEvents()
    const eventAddress = eventAddresses?.[eventIndex]

    // Get event details
    const { eventName, eventDate, eventLocation, ticketPrice, totalTickets, totalMinted } =
        useEventDetails(eventAddress)

    // Mint ticket hook
    const { mintTicket, isPending, isConfirming, isSuccess, error, hash } =
        useMintTicket(eventAddress)

    // Auto-refetch after successful purchase
    useEffect(() => {
        if (isSuccess) {
            // Refresh page data after successful mint
            setTimeout(() => window.location.reload(), 3000)
        }
    }, [isSuccess])

    if (loadingAddresses) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-pulse">Loading event...</div>
            </div>
        )
    }

    if (!eventAddress) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                Event not found
            </div>
        )
    }

    const handleBuyTicket = () => {
        if (!userAddress || !ticketPrice) return

        mintTicket({
            to: userAddress,
            tokenURI: `ipfs://tickets/${eventAddress}/${Date.now()}`, // Simple URI for now
            price: ticketPrice,
        })
    }

    // Format data
    const formattedDate = eventDate
        ? new Date(eventDate * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'TBA'

    const formattedPrice = ticketPrice ? formatEther(ticketPrice) : '0'

    // Convert BigInt to Number for calculations
    const totalTicketsNum = totalTickets ? Number(totalTickets) : 0
    const totalMintedNum = totalMinted ? Number(totalMinted) : 0

    const availableTickets = totalTicketsNum - totalMintedNum
    const soldPercentage = totalTicketsNum > 0
        ? (totalMintedNum / totalTicketsNum) * 100
        : 0

    console.log('Event Details:', {
        totalTickets: totalTickets?.toString(),
        totalMinted: totalMinted?.toString(),
        available: availableTickets
    })

    return (
        <div className="min-h-screen pb-12">
            {/* Hero Banner */}
            <div className="h-[400px] relative overflow-hidden bg-gradient-to-br from-primary/20 to-purple-900/20">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-10">
                    🎫
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {eventName || 'Loading...'}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span>{eventLocation || 'TBA'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Ticket className="h-5 w-5 text-primary" />
                                    <span className="font-mono text-xs">{eventAddress?.slice(0, 6)}...{eventAddress?.slice(-4)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-2xl font-bold mb-4">About Event</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                This event is secured on the blockchain using NFT tickets.
                                Each ticket is a unique digital asset that proves your ownership and cannot be counterfeited.
                                <br /><br />
                                Features of blockchain tickets:
                            </p>
                            <ul className="text-muted-foreground">
                                <li>✅ Verifiable authenticity</li>
                                <li>✅ Transparent pricing with ceiling on resales</li>
                                <li>✅ Automatic royalties to organizers</li>
                                <li>✅ Secure transfer of ownership</li>
                            </ul>
                        </div>

                        {/* Transaction Status */}
                        {(isPending || isConfirming || isSuccess || error) && (
                            <div className="bg-card border border-white/10 rounded-xl p-6">
                                <h3 className="text-xl font-bold mb-4">Transaction Status</h3>
                                {isPending && (
                                    <div className="flex items-center gap-3 text-yellow-400">
                                        <div className="animate-spin">⏳</div>
                                        <span>Waiting for wallet confirmation...</span>
                                    </div>
                                )}
                                {isConfirming && (
                                    <div className="flex items-center gap-3 text-blue-400">
                                        <div className="animate-pulse">⛓️</div>
                                        <span>Transaction confirming on blockchain...</span>
                                    </div>
                                )}
                                {isSuccess && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-green-400">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>Ticket purchased successfully! 🎉</span>
                                        </div>
                                        {hash && (
                                            <p className="text-xs text-muted-foreground">
                                                Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Check your wallet for the NFT ticket. Page will refresh in 3s...
                                        </p>
                                    </div>
                                )}
                                {error && (
                                    <div className="flex items-center gap-3 text-red-400">
                                        <XCircle className="h-5 w-5" />
                                        <span>Error: {error.message}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-white/10 rounded-xl p-6 sticky top-24 space-y-6">
                            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Price</p>
                                <p className="text-3xl font-bold text-primary">{formattedPrice} ETH</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Tickets</span>
                                    <span className="font-medium">{totalTickets || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Available</span>
                                    <span className="font-medium">{availableTickets}</span>
                                </div>
                                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-primary h-full transition-all duration-500"
                                        style={{ width: `${soldPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {!isConnected ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-center text-muted-foreground mb-2">
                                        Connect your wallet to purchase tickets
                                    </p>
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        variant="outline"
                                        disabled
                                    >
                                        Connect Wallet First
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Use the "Connect Wallet" button in the top-right corner
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        variant="gradient"
                                        onClick={handleBuyTicket}
                                        disabled={isPending || isConfirming || availableTickets === 0}
                                    >
                                        {isPending || isConfirming
                                            ? "Processing..."
                                            : availableTickets === 0
                                                ? "Sold Out"
                                                : "Buy Ticket"}
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Powered by Blockchain. Secure & Verifiable.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

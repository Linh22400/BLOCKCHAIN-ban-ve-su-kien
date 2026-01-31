"use client"

import { useGetAllEvents } from "@/hooks/useEventFactory"
import { fetchAllListedTickets, ListedTicket } from "@/utils/fetchListedTickets"
import { useBuyListedTicket } from "@/hooks/useEventTicket"
import { useEffect, useState } from "react"
import { formatEther } from "viem"
import { Button } from "@/components/ui/button"
import { Ticket as TicketIcon, Loader2, ShoppingCart, Tag } from "lucide-react"
import { useAccount } from "wagmi"

import { toast } from "sonner"

function MarketplaceTicketCard({ ticket, onBuySuccess }: { ticket: ListedTicket, onBuySuccess: () => void }) {
    const { buyListedTicket, isPending, isConfirming, isSuccess } = useBuyListedTicket(ticket.eventAddress)
    const { address } = useAccount()
    const isOwner = address && ticket.owner.toLowerCase() === address.toLowerCase()

    useEffect(() => {
        if (isSuccess) {
            toast.success("Ticket purchased successfully!")
            onBuySuccess()
        }
    }, [isSuccess, onBuySuccess])

    const handleBuy = () => {
        if (!address) {
            toast.error("Please connect your wallet first")
            return
        }
        buyListedTicket({ tokenId: ticket.tokenId, price: ticket.price })
    }

    return (
        <div className="bg-card border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                        <TicketIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Ticket #{ticket.tokenId}</h3>
                        <p className="text-xs text-muted-foreground">{ticket.eventName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-lg font-bold text-green-400">{formatEther(ticket.price)} ETH</p>
                </div>
            </div>

            <div className="bg-background/50 rounded-lg p-3 mb-4 text-xs font-mono text-muted-foreground break-all">
                Owner: {ticket.owner.slice(0, 6)}...{ticket.owner.slice(-4)}
            </div>

            <Button
                onClick={handleBuy}
                disabled={isPending || isConfirming || !!isOwner}
                className="w-full"
                variant={isOwner ? "secondary" : "default"}
            >
                {(isPending || isConfirming) ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : isOwner ? (
                    "You Own This"
                ) : (
                    <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy Ticket
                    </>
                )}
            </Button>
        </div>
    )
}

export default function MarketplacePage() {
    const { eventAddresses } = useGetAllEvents()
    const [tickets, setTickets] = useState<ListedTicket[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (eventAddresses && eventAddresses.length > 0) {
            fetchAllListedTickets(eventAddresses).then(res => {
                setTickets(res)
                setLoading(false)
            })
        } else if (eventAddresses && eventAddresses.length === 0) {
            setLoading(false)
        }
    }, [eventAddresses])

    const refreshTickets = () => {
        if (eventAddresses && eventAddresses.length > 0) {
            setLoading(true)
            fetchAllListedTickets(eventAddresses).then(res => {
                setTickets(res)
                setLoading(false)
            })
        }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
                    <p className="text-muted-foreground">
                        Buy and sell tickets safely on the secondary market
                    </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                    <Tag className="h-8 w-8 text-primary" />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-card border border-white/10 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-20 bg-card border border-white/5 rounded-xl">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-bold mb-2">No Tickets Listed</h3>
                    <p className="text-muted-foreground">
                        There are currently no tickets for sale. Check back later!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket) => (
                        <MarketplaceTicketCard
                            key={`${ticket.eventAddress}-${ticket.tokenId}`}
                            ticket={ticket}
                            onBuySuccess={refreshTickets}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

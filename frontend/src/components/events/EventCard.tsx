"use client";

import Link from "next/link"
import { Calendar, MapPin, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEventDetails } from "@/hooks/useEventTicket"
import { formatEther } from "viem"

interface EventCardProps {
    eventAddress: string
    eventId: number
}

export function EventCard({ eventAddress, eventId }: EventCardProps) {
    const { eventName, eventDate, eventLocation, ticketPrice, totalTickets, totalMinted } = useEventDetails(eventAddress);

    // Loading state
    if (!eventName) {
        return (
            <div className="h-80 bg-card border border-white/10 rounded-xl animate-pulse" />
        );
    }

    // Format date
    const formattedDate = eventDate
        ? new Date(eventDate * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
        : 'TBA';

    // Format price
    const formattedPrice = ticketPrice
        ? `${formatEther(ticketPrice)} ETH`
        : '0 ETH';

    // Convert BigInt to Number safely
    const totalTicketsNum = totalTickets ? Number(totalTickets) : 0;
    const totalMintedNum = totalMinted ? Number(totalMinted) : 0;
    const availableTickets = totalTicketsNum - totalMintedNum;

    // Debug logging
    console.log('Event:', eventName, {
        totalTickets: totalTickets?.toString(),
        totalMinted: totalMinted?.toString(),
        available: availableTickets
    });

    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
            <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/20 to-purple-900/20 flex items-center justify-center">
                <div className="text-6xl opacity-20">🎫</div>
                <div className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                    {formattedPrice}
                </div>
            </div>

            <div className="p-5">
                <h3 className="mb-2 text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                    {eventName}
                </h3>

                <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="line-clamp-1">{eventLocation || 'TBA'}</span>
                    </div>
                    {totalTickets !== undefined && totalMinted !== undefined && (
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            <span>{totalMintedNum}/{totalTicketsNum} sold • {availableTickets} available</span>
                        </div>
                    )}
                </div>

                <Link href={`/events/${eventId}`} className="block">
                    <Button className="w-full" variant="secondary">
                        View Details
                    </Button>
                </Link>
            </div>
        </div>
    )
}

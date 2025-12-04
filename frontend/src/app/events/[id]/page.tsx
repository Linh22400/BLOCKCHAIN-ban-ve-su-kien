"use client"

import { useParams } from "next/navigation"
import { EVENTS } from "@/lib/mockData"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, User, Ticket } from "lucide-react"
import { useState } from "react"

export default function EventDetailsPage() {
    const params = useParams()
    const id = Number(params.id)
    const event = EVENTS.find((e) => e.id === id)
    const [isBuying, setIsBuying] = useState(false)

    if (!event) {
        return <div className="container mx-auto px-4 py-12 text-center">Event not found</div>
    }

    const handleBuy = () => {
        setIsBuying(true)
        setTimeout(() => {
            alert("Ticket purchased successfully! (Mock)")
            setIsBuying(false)
        }, 1500)
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Hero Banner */}
            <div className="h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
                            <div className="flex flex-wrap gap-6 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <span>{event.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    <span>{event.organizer}</span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-2xl font-bold mb-4">About Event</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {event.description}
                                <br /><br />
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-white/10 rounded-xl p-6 sticky top-24 space-y-6">
                            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Price</p>
                                <p className="text-3xl font-bold text-primary">{event.price}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Tickets</span>
                                    <span className="font-medium">{event.totalTickets}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Available</span>
                                    <span className="font-medium">{event.totalTickets - event.soldTickets}</span>
                                </div>
                                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-primary h-full transition-all duration-500"
                                        style={{ width: `${(event.soldTickets / event.totalTickets) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                variant="gradient"
                                onClick={handleBuy}
                                disabled={isBuying}
                            >
                                {isBuying ? "Processing..." : "Buy Ticket"}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                Powered by Blockchain. Secure & Verifiable.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

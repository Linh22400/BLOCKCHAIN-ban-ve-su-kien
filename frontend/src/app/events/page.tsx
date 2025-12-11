"use client";

import { EventCard } from "@/components/events/EventCard";
import { useGetAllEvents } from "@/hooks/useEventFactory";

export default function EventsPage() {
    const { eventAddresses, isLoading, error } = useGetAllEvents();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">All Events</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-80 bg-card border border-white/10 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">All Events</h1>
                <div className="text-center py-12 text-red-400">
                    Error loading events: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8">All Events</h1>

            {!eventAddresses || eventAddresses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No events found. Create your first event!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {eventAddresses.map((address, index) => (
                        <EventCard key={address} eventAddress={address} eventId={index} />
                    ))}
                </div>
            )}
        </div>
    );
}

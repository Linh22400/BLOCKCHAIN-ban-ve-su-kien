import { TicketCard } from "@/components/tickets/TicketCard";
import { MY_TICKETS } from "@/lib/mockData";

export default function MyTicketsPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8">My Tickets</h1>

            <div className="grid grid-cols-1 gap-6">
                {MY_TICKETS.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                ))}
            </div>

            {MY_TICKETS.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    You don't have any tickets yet.
                </div>
            )}
        </div>
    );
}

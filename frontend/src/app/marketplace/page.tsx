import { MarketplaceCard } from "@/components/tickets/MarketplaceCard";
import { MARKETPLACE_TICKETS } from "@/lib/mockData";

export default function MarketplacePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
                    <p className="text-muted-foreground">Buy and sell verified NFT tickets.</p>
                </div>

                {/* Filter/Search placeholders could go here */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MARKETPLACE_TICKETS.map((ticket) => (
                    <MarketplaceCard key={ticket.id} ticket={ticket} />
                ))}
            </div>
        </div>
    );
}

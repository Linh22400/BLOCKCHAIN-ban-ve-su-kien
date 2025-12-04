import { Button } from "@/components/ui/button"
import { Calendar, MapPin, User } from "lucide-react"

interface MarketplaceCardProps {
    ticket: {
        id: number
        title: string
        date: string
        location: string
        image: string
        tokenId: string
        price: string
        seller: string
    }
}

export function MarketplaceCard({ ticket }: MarketplaceCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
            <div className="aspect-[16/9] overflow-hidden">
                <img
                    src={ticket.image}
                    alt={ticket.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/10">
                    {ticket.tokenId}
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                        {ticket.title}
                    </h3>
                </div>

                <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{ticket.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="line-clamp-1">{ticket.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="line-clamp-1">Seller: {ticket.seller}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="text-lg font-bold text-white">
                        {ticket.price}
                    </div>
                    <Button size="sm" variant="gradient">
                        Buy Now
                    </Button>
                </div>
            </div>
        </div>
    )
}

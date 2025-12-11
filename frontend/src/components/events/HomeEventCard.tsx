import Link from "next/link"
import { Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HomeEventCardProps {
    event: {
        id: number
        title: string
        date: string
        location: string
        price: string
        image: string
    }
}

export function HomeEventCard({ event }: HomeEventCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
            <div className="aspect-[16/9] overflow-hidden">
                <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                    {event.price}
                </div>
            </div>

            <div className="p-5">
                <h3 className="mb-2 text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                    {event.title}
                </h3>

                <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="line-clamp-1">{event.location}</span>
                    </div>
                </div>

                <Link href={`/events/${event.id}`} className="block">
                    <Button className="w-full" variant="secondary">
                        View Details
                    </Button>
                </Link>
            </div>
        </div>
    )
}

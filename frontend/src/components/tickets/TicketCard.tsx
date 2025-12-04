import { QrCode, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TicketCardProps {
    ticket: {
        id: number
        title: string
        date: string
        location: string
        image: string
        tokenId: string
        status: string
    }
}

export function TicketCard({ ticket }: TicketCardProps) {
    return (
        <div className="flex flex-col md:flex-row bg-card border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
            <div className="md:w-1/3 h-48 md:h-auto relative">
                <img
                    src={ticket.image}
                    alt={ticket.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                    {ticket.tokenId}
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold">{ticket.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${ticket.status === 'active' ? 'bg-green-500/20 text-green-500' :
                                ticket.status === 'used' ? 'bg-gray-500/20 text-gray-500' :
                                    'bg-yellow-500/20 text-yellow-500'
                            }`}>
                            {ticket.status}
                        </span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{ticket.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{ticket.location}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0">
                    <Button variant="outline" className="flex-1 gap-2">
                        <QrCode className="h-4 w-4" /> Show QR
                    </Button>
                    {ticket.status === 'active' && (
                        <Button variant="secondary" className="flex-1">
                            Sell Ticket
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

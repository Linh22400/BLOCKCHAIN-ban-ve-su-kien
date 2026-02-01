"use client"

import { useAccount } from "wagmi"
import { useGetAllEvents } from "@/hooks/useEventFactory"
import { useEventDetails, useUnlistTicket } from "@/hooks/useEventTicket"
import { Calendar, MapPin, Ticket as TicketIcon, ExternalLink, Tag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatEther } from "viem"
import { useEffect, useState, useRef } from "react"
import { fetchUserTickets, UserTicket } from "@/utils/fetchUserTickets"
import { SellTicketModal } from "@/components/marketplace/SellTicketModal"
import { fetchSoldTickets, SoldTicket } from "@/utils/fetchSoldTickets"
import { toast } from "sonner"

// Component for sold tickets
function SoldTicketList({ eventAddresses }: { eventAddresses: string[] }) {
    const { address } = useAccount()
    const [soldTickets, setSoldTickets] = useState<SoldTicket[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (address && eventAddresses.length > 0) {
            fetchSoldTickets(eventAddresses, address).then(res => {
                setSoldTickets(res)
                setLoading(false)
            })
        } else {
            setLoading(false)
        }
    }, [address, eventAddresses])

    if (loading) return <div className="flex gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải lịch sử...</div>
    if (soldTickets.length === 0) return <p className="text-sm text-muted-foreground">Chưa bán vé nào.</p>

    return (
        <div className="space-y-3">
            {soldTickets.map((ticket) => (
                <div key={`${ticket.eventAddress}-${ticket.tokenId}-${ticket.transactionHash}`} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex justify-between items-center">
                    <div>
                        <p className="font-bold text-sm">Vé #{ticket.tokenId}</p>
                        <p className="text-xs text-muted-foreground truncate w-32">Tx: {ticket.transactionHash.slice(0, 10)}...</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-green-400">+{formatEther(ticket.price)} ETH</p>
                        <a
                            href={`https://sepolia.etherscan.io/tx/${ticket.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-muted-foreground hover:underline"
                        >
                            Xem trên Etherscan
                        </a>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Retrieve specific tickets component
function TicketList({ eventAddress, maxResalePrice }: { eventAddress: string, maxResalePrice: bigint }) {
    const { address } = useAccount()
    const [tickets, setTickets] = useState<UserTicket[]>([])
    const [loading, setLoading] = useState(true)
    const [sellModalOpen, setSellModalOpen] = useState(false)
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)

    const { unlistTicket, isSuccess: isUnlistSuccess } = useUnlistTicket(eventAddress)

    useEffect(() => {
        if (address && eventAddress) {
            fetchUserTickets(eventAddress, address).then((res: UserTicket[]) => {
                console.log('📊 Fetched tickets:', res) // Debug log
                setTickets(res)
                setLoading(false)
            })
        }
    }, [address, eventAddress, isUnlistSuccess]) // Refetch on unlist success

    const hasShownUnlistToast = useRef(false)
    useEffect(() => {
        if (isUnlistSuccess && !hasShownUnlistToast.current) {
            hasShownUnlistToast.current = true
            toast.success("Gỡ bán vé thành công!")
        }
    }, [isUnlistSuccess])


    const handleSellClick = (tokenId: number) => {
        setSelectedTicketId(tokenId)
        setSellModalOpen(true)
    }

    const handleSellSuccess = () => {
        setSellModalOpen(false)
        toast.success("Đăng bán vé thành công!")
        // Trigger refetch after short delay to allow chain update
        setTimeout(() => {
            if (address && eventAddress) {
                fetchUserTickets(eventAddress, address).then((res: UserTicket[]) => setTickets(res))
            }
        }, 2000)
    }

    if (loading) return <div className="text-sm text-muted-foreground">Đang tải vé...</div>
    if (tickets.length === 0) return <p className="text-sm text-muted-foreground">Bạn chưa có vé nào cho sự kiện này.</p>

    return (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tickets.map((t) => (
                <div key={t.tokenId} className="bg-background/50 border border-white/5 rounded-lg p-3 flex justify-between items-center">
                    <div>
                        <p className="font-mono text-sm font-bold">Vé #{t.tokenId}</p>
                        {t.isUsed ? (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                ✓ Đã Sử Dụng
                            </p>
                        ) : t.price > BigInt(0) ? (
                            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {formatEther(t.price)} ETH
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground mt-1">Chưa đăng bán</p>
                        )}
                    </div>
                    <div>
                        {t.isUsed ? (
                            <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                                Đã Dùng
                            </Button>
                        ) : t.price > BigInt(0) ? (
                            <Button variant="destructive" size="sm" onClick={() => unlistTicket(t.tokenId)}>
                                Gỡ Bán
                            </Button>
                        ) : (
                            <Button variant="secondary" size="sm" onClick={() => handleSellClick(t.tokenId)}>
                                Bán
                            </Button>
                        )}
                    </div>
                </div>
            ))}

            {selectedTicketId !== null && (
                <SellTicketModal
                    isOpen={sellModalOpen}
                    onClose={() => { setSellModalOpen(false); setSelectedTicketId(null); }}
                    eventAddress={eventAddress}
                    tokenId={selectedTicketId}
                    maxResalePrice={maxResalePrice}
                    onSuccess={handleSellSuccess}
                />
            )}
        </div>
    )
}

// Component for individual event card
function TicketCard({ eventAddress, eventIndex }: { eventAddress: string; eventIndex: number }) {
    const { eventName, eventDate, eventLocation, ticketPrice, maxResalePrice } = useEventDetails(eventAddress)

    const formattedDate = eventDate
        ? new Date(eventDate * 1000).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Chưa xác định'

    const formattedPrice = ticketPrice ? formatEther(ticketPrice) : '0'

    return (
        <div className="bg-card border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <TicketIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{eventName || 'Đang tải...'}</h3>
                            <a href={`/events/${eventIndex}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                Xem Chi Tiết Sự Kiện <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Giá Gốc</p>
                    <p className="text-lg font-bold text-primary">{formattedPrice} ETH</p>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{eventLocation || 'Chưa xác định'}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-semibold mb-2">Vé Của Bạn</p>
                <TicketList eventAddress={eventAddress} maxResalePrice={maxResalePrice || BigInt(0)} />
            </div>
        </div>
    )
}

export default function MyTicketsPage() {
    const { address, isConnected } = useAccount()
    const { eventAddresses, isLoading } = useGetAllEvents()

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">Vé Của Tôi</h1>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-8 text-center">
                    <TicketIcon className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-xl font-bold mb-2">Kết Nối Ví Của Bạn</h3>
                    <p className="text-muted-foreground">
                        Vui lòng kết nối ví để xem vé NFT của bạn
                    </p>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">Vé Của Tôi</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-64 bg-card border border-white/10 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Vé Của Tôi</h1>
                <p className="text-muted-foreground">
                    Quản lý vé của bạn và xem lịch sử bán hàng
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Ticket List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Ví Của Bạn</h2>
                    {(!eventAddresses || eventAddresses.length === 0) ? (
                        <div className="text-center py-12 bg-card border border-white/10 rounded-xl">
                            <p className="text-muted-foreground">Không tìm thấy sự kiện.</p>
                        </div>
                    ) : (
                        eventAddresses.map((address, index) => (
                            <TicketCard
                                key={address}
                                eventAddress={address}
                                eventIndex={index}
                            />
                        ))
                    )}
                </div>

                {/* Sales History Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-card border border-white/10 rounded-xl p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                            💰 Lịch Sử Bán Hàng
                        </h2>
                        {eventAddresses && <SoldTicketList eventAddresses={eventAddresses} />}
                    </div>
                </div>
            </div>
        </div>
    )
}

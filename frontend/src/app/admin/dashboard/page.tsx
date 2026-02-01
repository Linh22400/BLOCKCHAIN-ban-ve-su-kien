"use client"

import { useAccount } from "wagmi"
import { useGetOrganizerEvents } from "@/hooks/useEventFactory"
import { useEventDetails } from "@/hooks/useEventTicket"
import { Calendar, MapPin, Users, DollarSign, BarChart3, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatEther } from "viem"
import Link from "next/link"

function EventManagementCard({ eventAddress, eventIndex }: { eventAddress: string; eventIndex: number }) {
    const { eventName, eventDate, eventLocation, ticketPrice, totalTickets, totalMinted } =
        useEventDetails(eventAddress)

    if (!eventName) return null

    const formattedDate = eventDate
        ? new Date(eventDate * 1000).toLocaleDateString('vi-VN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
        : 'Chưa xác định'

    const formattedPrice = ticketPrice ? formatEther(ticketPrice) : '0'
    const soldCount = totalMinted || 0
    const totalCount = totalTickets || 0
    const soldPercentage = totalCount > 0 ? (soldCount / totalCount) * 100 : 0
    const revenue = ticketPrice && totalMinted
        ? formatEther(ticketPrice * BigInt(totalMinted))
        : '0'

    return (
        <div className="bg-card border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold mb-1">{eventName}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{eventLocation}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{soldCount}/{totalCount}</p>
                    <p className="text-xs text-muted-foreground">Vé Đã Bán</p>
                </div>
                <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold">{revenue}</p>
                    <p className="text-xs text-muted-foreground">Doanh Thu (ETH)</p>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <BarChart3 className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold">{soldPercentage.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Đã Bán</p>
                </div>
            </div>

            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-4">
                <div
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${soldPercentage}%` }}
                />
            </div>

            <div className="flex gap-2">
                <Link href={`/events/${eventIndex}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                        Xem Sự Kiện
                    </Button>
                </Link>
                <Link href={`/admin/checkin/${eventAddress}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                        <QrCode className="h-4 w-4 mr-2" />
                        Điểm Danh
                    </Button>
                </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-muted-foreground">
                <p className="font-mono">{eventAddress.slice(0, 10)}...{eventAddress.slice(-8)}</p>
            </div>
        </div>
    )
}

export default function AdminDashboardPage() {
    const { address, isConnected } = useAccount()
    const { eventAddresses, isLoading, error } = useGetOrganizerEvents(address)

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">Bảng Điều Khiển Tổ Chức</h1>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-8 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-xl font-bold mb-2">Kết Nối Ví Của Bạn</h3>
                    <p className="text-muted-foreground">
                        Kết nối ví để quản lý sự kiện của bạn
                    </p>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">Bảng Điều Khiển Tổ Chức</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-80 bg-card border border-white/10 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Bảng Điều Khiển Tổ Chức</h1>
                    <p className="text-muted-foreground">
                        Quản lý sự kiện và theo dõi hiệu suất
                    </p>
                </div>
                <Link href="/admin/create">
                    <Button variant="gradient" size="lg">
                        Tạo Sự Kiện Mới
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                    <p className="text-red-500 text-sm">Lỗi: {error.message}</p>
                </div>
            )}

            {(!eventAddresses || eventAddresses.length === 0) ? (
                <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-bold mb-2">Chưa Có Sự Kiện</h3>
                    <p className="text-muted-foreground mb-4">
                        Bạn chưa tạo sự kiện nào
                    </p>
                    <Link href="/admin/create">
                        <Button variant="gradient">
                            Tạo Sự Kiện Đầu Tiên
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {eventAddresses.map((address, index) => (
                            <EventManagementCard
                                key={address}
                                eventAddress={address}
                                eventIndex={index}
                            />
                        ))}
                    </div>

                    <div className="bg-card border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-2">💡 Mẹo Dành Cho Người Tổ Chức</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Sử dụng nút Điểm Danh để xác thực vé tại sự kiện của bạn</li>
                            <li>• Theo dõi doanh số bán hàng theo thời gian thực từ dashboard</li>
                            <li>• Doanh thu tự động được gửi đến ví của bạn</li>
                            <li>• Hoa hồng bán lại được thực thi bởi smart contract</li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    )
}

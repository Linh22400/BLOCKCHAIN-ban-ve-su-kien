"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useCreateEvent } from "@/hooks/useEventFactory"
import { parseEther } from "viem"
import { useAccount } from "wagmi"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateEventPage() {
    const router = useRouter()
    const { address, isConnected } = useAccount()
    const { createEvent, isPending, isConfirming, isSuccess, error, hash } = useCreateEvent()

    const [formData, setFormData] = useState({
        eventName: "",
        eventDate: "",
        eventTime: "",
        location: "",
        totalTickets: "",
        ticketPrice: "",
        maxResalePrice: "",
        royaltyPercentage: "5", // Default 5%
        description: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isConnected || !address) {
            alert("Vui lòng kết nối ví trước")
            return
        }

        // Combine date and time
        const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`)
        const eventDateUnix = Math.floor(eventDateTime.getTime() / 1000)

        // Parse prices to wei
        const ticketPriceWei = parseEther(formData.ticketPrice)
        const maxResalePriceWei = parseEther(formData.maxResalePrice)

        // Create event
        createEvent({
            name: formData.eventName.replace(/\s+/g, ""), // Remove spaces for symbol
            symbol: formData.eventName.slice(0, 6).toUpperCase().replace(/\s+/g, ""),
            eventName: formData.eventName,
            eventDate: eventDateUnix,
            eventLocation: formData.location,
            ticketPrice: ticketPriceWei,
            maxResalePrice: maxResalePriceWei,
            royaltyPercentage: Number(formData.royaltyPercentage) * 100, // Convert to basis points
            totalTickets: Number(formData.totalTickets),
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    // Redirect after success
    if (isSuccess && hash) {
        setTimeout(() => {
            router.push("/events")
        }, 3000)
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-4xl font-bold mb-2">Tạo Sự Kiện Mới</h1>
            <p className="text-muted-foreground mb-8">
                Triển khai NFT ticketing contract mới trên blockchain
            </p>

            {!isConnected && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                    <p className="text-yellow-500 text-sm">
                        ⚠️ Vui lòng kết nối ví để tạo sự kiện
                    </p>
                </div>
            )}

            {/* Transaction Status */}
            {(isPending || isConfirming || isSuccess || error) && (
                <div className="bg-card border border-white/10 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-bold mb-3">Trạng Thái Giao Dịch</h3>
                    {isPending && (
                        <div className="flex items-center gap-3 text-yellow-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Đang chờ xác nhận từ ví...</span>
                        </div>
                    )}
                    {isConfirming && (
                        <div className="flex items-center gap-3 text-blue-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Đang triển khai contract trên blockchain...</span>
                        </div>
                    )}
                    {isSuccess && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-green-400">
                                <CheckCircle className="h-5 w-5" />
                                <span>Tạo sự kiện thành công! 🎉</span>
                            </div>
                            {hash && (
                                <p className="text-xs text-muted-foreground">
                                    Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Đang chuyển hướng đến trang sự kiện...
                            </p>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 text-red-400">
                            <XCircle className="h-5 w-5" />
                            <span>Lỗi: {error.message}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-card border border-white/10 rounded-xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tên Sự Kiện</label>
                        <Input
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleChange}
                            placeholder="VD: Lễ Hội Âm Nhạc Neon Nights"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ngày</label>
                            <Input
                                type="date"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Giờ</label>
                            <Input
                                type="time"
                                name="eventTime"
                                value={formData.eventTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Địa Điểm</label>
                        <Input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="VD: Sân Vận Động Quốc Gia Mỹ Đình"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tổng Số Vé</label>
                            <Input
                                type="number"
                                name="totalTickets"
                                value={formData.totalTickets}
                                onChange={handleChange}
                                min="1"
                                placeholder="1000"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Giá Vé (ETH)</label>
                            <Input
                                type="number"
                                name="ticketPrice"
                                value={formData.ticketPrice}
                                onChange={handleChange}
                                step="0.001"
                                min="0"
                                placeholder="0.05"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Giá Bán Lại Tối Đa (ETH)</label>
                            <Input
                                type="number"
                                name="maxResalePrice"
                                value={formData.maxResalePrice}
                                onChange={handleChange}
                                step="0.001"
                                min="0"
                                placeholder="0.06"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Ngăn chặn đầu cơ bằng cách giới hạn giá bán lại
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Hoa Hồng (%)</label>
                            <Input
                                type="number"
                                name="royaltyPercentage"
                                value={formData.royaltyPercentage}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                placeholder="5"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Phần trăm bạn nhận được từ mỗi lần bán lại
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mô Tả (Tùy Chọn)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Mô tả sự kiện của bạn..."
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        variant="gradient"
                        disabled={!isConnected || isPending || isConfirming}
                    >
                        {isPending || isConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang Tạo...
                            </>
                        ) : (
                            "Tạo Sự Kiện"
                        )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Hành động này sẽ triển khai smart contract mới trên blockchain
                    </p>
                </form>
            </div>
        </div>
    )
}

"use client"

import { useParams } from "next/navigation"
import { useAccount } from "wagmi"
import { useEventDetails, useMarkTicketUsed, useIsTicketValid } from "@/hooks/useEventTicket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { CheckCircle, XCircle, Loader2, AlertCircle, QrCode } from "lucide-react"

export default function CheckInPage() {
    const params = useParams()
    const eventAddress = params.eventId as string
    const { address, isConnected } = useAccount()

    const { eventName, eventDate, eventLocation } = useEventDetails(eventAddress)
    const { markTicketUsed, isPending, isConfirming, isSuccess, error, hash } = useMarkTicketUsed(eventAddress)

    const [tokenId, setTokenId] = useState("")
    const [userAddress, setUserAddress] = useState("")
    const [checkResult, setCheckResult] = useState<{ valid: boolean, message: string } | null>(null)
    const { isValid, refetch: checkValidity } = useIsTicketValid(
        eventAddress,
        tokenId ? Number(tokenId) : undefined,
        userAddress || undefined
    )

    const handleCheck = async () => {
        if (!tokenId || !userAddress) {
            setCheckResult({ valid: false, message: "Vui lòng nhập cả Token ID và Address" })
            return
        }

        const result = await checkValidity()
        const valid = result.data as boolean

        setCheckResult({
            valid,
            message: valid
                ? "✅ Vé hợp lệ! Sẵn sàng điểm danh."
                : "❌ Vé không hợp lệ hoặc đã được sử dụng"
        })
    }

    const handleCheckIn = () => {
        if (!tokenId) return
        markTicketUsed(Number(tokenId))
        setCheckResult(null)
    }

    const formattedDate = eventDate
        ? new Date(eventDate * 1000).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Chưa xác định'

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">Hệ Thống Điểm Danh</h1>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-xl font-bold mb-2">Yêu Cầu Quyền Người Tổ Chức</h3>
                    <p className="text-muted-foreground">
                        Kết nối ví để truy cập hệ thống điểm danh
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Hệ Thống Điểm Danh</h1>
                <p className="text-muted-foreground">
                    Xác thực và điểm danh người tham dự cho sự kiện của bạn
                </p>
            </div>

            {/* Event Info */}
            <div className="bg-card border border-white/10 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold mb-2">{eventName || 'Đang tải...'}</h2>
                <p className="text-muted-foreground mb-1">{formattedDate}</p>
                <p className="text-sm text-muted-foreground">{eventLocation}</p>
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                    {eventAddress.slice(0, 10)}...{eventAddress.slice(-8)}
                </p>
            </div>

            {/* Transaction Status */}
            {(isPending || isConfirming || isSuccess || error) && (
                <div className="bg-card border border-white/10 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-bold mb-3">Trạng Thái Giao Dịch</h3>
                    {isPending && (
                        <div className="flex items-center gap-3 text-yellow-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Đang chờ xác nhận...</span>
                        </div>
                    )}
                    {isConfirming && (
                        <div className="flex items-center gap-3 text-blue-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Đang đánh dấu vé đã sử dụng...</span>
                        </div>
                    )}
                    {isSuccess && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-green-400">
                                <CheckCircle className="h-5 w-5" />
                                <span>Điểm danh thành công!</span>
                            </div>
                            {hash && (
                                <p className="text-xs text-muted-foreground">
                                    Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
                                </p>
                            )}
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

            {/* Check-in Form */}
            <div className="bg-card border border-white/10 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <QrCode className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Xác Thực Vé</h3>
                        <p className="text-sm text-muted-foreground">
                            Nhập thông tin vé để điểm danh
                        </p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Token ID</label>
                        <Input
                            type="number"
                            value={tokenId}
                            onChange={(e) => setTokenId(e.target.value)}
                            placeholder="VD: 0, 1, 2..."
                            min="0"
                        />
                        <p className="text-xs text-muted-foreground">
                            Token ID của NFT từ vé
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Địa Chỉ Ví Người Giữ Vé</label>
                        <Input
                            value={userAddress}
                            onChange={(e) => setUserAddress(e.target.value)}
                            placeholder="0x..."
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Địa chỉ ví sở hữu vé này
                        </p>
                    </div>
                </div>

                {checkResult && (
                    <div className={`p-4 rounded-lg border mb-4 ${checkResult.valid
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        <p className="font-medium">{checkResult.message}</p>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCheck}
                        disabled={!tokenId || !userAddress}
                        className="flex-1"
                    >
                        Xác Thực Vé
                    </Button>
                    <Button
                        variant="gradient"
                        onClick={handleCheckIn}
                        disabled={!tokenId || !checkResult?.valid || isPending || isConfirming}
                        className="flex-1"
                    >
                        {isPending || isConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang Xử Lý...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Điểm Danh
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-bold text-sm mb-2">💡 Cách Hoạt Động</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                    <li>1. Người tham dự xuất trình NFT ticket (Token ID + địa chỉ ví)</li>
                    <li>2. Click "Xác Thực Vé" để kiểm tra tính hợp lệ</li>
                    <li>3. Nếu hợp lệ, click "Điểm Danh" để đánh dấu đã sử dụng</li>
                    <li>4. Vé đã sử dụng không thể dùng lại hoặc bán lại</li>
                </ul>
            </div>
        </div>
    )
}

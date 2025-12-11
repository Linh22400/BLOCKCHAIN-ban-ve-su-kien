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
            setCheckResult({ valid: false, message: "Please enter both Token ID and Address" })
            return
        }

        const result = await checkValidity()
        const valid = result.data as boolean

        setCheckResult({
            valid,
            message: valid
                ? "✅ Valid ticket! Ready to check in."
                : "❌ Invalid ticket or already used"
        })
    }

    const handleCheckIn = () => {
        if (!tokenId) return
        markTicketUsed(Number(tokenId))
        setCheckResult(null)
    }

    const formattedDate = eventDate
        ? new Date(eventDate * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'TBA'

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">Check-in System</h1>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-xl font-bold mb-2">Organizer Access Required</h3>
                    <p className="text-muted-foreground">
                        Connect your wallet to access check-in
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Check-in System</h1>
                <p className="text-muted-foreground">
                    Verify and check in attendees for your event
                </p>
            </div>

            {/* Event Info */}
            <div className="bg-card border border-white/10 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold mb-2">{eventName || 'Loading...'}</h2>
                <p className="text-muted-foreground mb-1">{formattedDate}</p>
                <p className="text-sm text-muted-foreground">{eventLocation}</p>
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                    {eventAddress.slice(0, 10)}...{eventAddress.slice(-8)}
                </p>
            </div>

            {/* Transaction Status */}
            {(isPending || isConfirming || isSuccess || error) && (
                <div className="bg-card border border-white/10 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-bold mb-3">Transaction Status</h3>
                    {isPending && (
                        <div className="flex items-center gap-3 text-yellow-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Waiting for confirmation...</span>
                        </div>
                    )}
                    {isConfirming && (
                        <div className="flex items-center gap-3 text-blue-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Marking ticket as used...</span>
                        </div>
                    )}
                    {isSuccess && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-green-400">
                                <CheckCircle className="h-5 w-5" />
                                <span>Ticket checked in successfully!</span>
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
                            <span>Error: {error.message}</span>
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
                        <h3 className="text-xl font-bold">Verify Ticket</h3>
                        <p className="text-sm text-muted-foreground">
                            Enter ticket details to check in
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
                            placeholder="e.g. 0, 1, 2..."
                            min="0"
                        />
                        <p className="text-xs text-muted-foreground">
                            The NFT token ID from the ticket
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ticket Holder Address</label>
                        <Input
                            value={userAddress}
                            onChange={(e) => setUserAddress(e.target.value)}
                            placeholder="0x..."
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            The wallet address that owns this ticket
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
                        Verify Ticket
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
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Check In
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-bold text-sm mb-2">💡 How it works</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                    <li>1. Attendee shows their NFT ticket (Token ID + wallet address)</li>
                    <li>2. Click "Verify Ticket" to check if it's valid</li>
                    <li>3. If valid, click "Check In" to mark as used</li>
                    <li>4. Used tickets cannot be reused or resold</li>
                </ul>
            </div>
        </div>
    )
}

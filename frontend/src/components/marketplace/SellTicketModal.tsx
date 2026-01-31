"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useListTicket } from "@/hooks/useEventTicket"
import { parseEther } from "viem"
import { Loader2 } from "lucide-react"

interface SellTicketModalProps {
    isOpen: boolean
    onClose: () => void
    eventAddress: string
    tokenId: number
    maxResalePrice: bigint
    onSuccess?: () => void
}

export function SellTicketModal({ isOpen, onClose, eventAddress, tokenId, maxResalePrice, onSuccess }: SellTicketModalProps) {
    const [price, setPrice] = useState("")
    const { listTicket, isPending, isConfirming, isSuccess } = useListTicket(eventAddress)

    const handleList = () => {
        if (!price) return
        try {
            const priceWei = parseEther(price)
            if (priceWei > maxResalePrice) {
                alert("Price exceeds maximum resale price")
                return
            }
            listTicket({ tokenId, price: priceWei })
        } catch (e) {
            console.error(e)
        }
    }

    // Close modal on success
    useEffect(() => {
        if (isSuccess) {
            if (onSuccess) onSuccess();
            else onClose();
        }
    }, [isSuccess, onClose, onSuccess])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-background border-white/10">
                <DialogHeader>
                    <DialogTitle>Sell Ticket #{tokenId}</DialogTitle>
                    <DialogDescription>
                        List your ticket for sale on the marketplace.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Price (ETH)
                        </Label>
                        <Input
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="col-span-3"
                            placeholder="0.01"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                        Max Price: {maxResalePrice ? Number(maxResalePrice) / 1e18 : 0} ETH
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleList} disabled={isPending || isConfirming || !price}>
                        {(isPending || isConfirming) ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing
                            </>
                        ) : "List Ticket"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import Link from "next/link"
import { Ticket, Menu, X } from "lucide-react"
import { useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gradient">NFT Tix</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
                        Events
                    </Link>
                    <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">
                        Marketplace
                    </Link>
                    <Link href="/my-tickets" className="text-sm font-medium hover:text-primary transition-colors">
                        My Tickets
                    </Link>
                    <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                        Organizer
                    </Link>
                    <Link href="/admin/create" className="text-sm font-medium hover:text-primary transition-colors">
                        Create Event
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <ConnectButton />
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-white/10 bg-background p-4 flex flex-col gap-4">
                    <Link
                        href="/events"
                        className="text-sm font-medium hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Events
                    </Link>
                    <Link
                        href="/marketplace"
                        className="text-sm font-medium hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Marketplace
                    </Link>
                    <Link
                        href="/my-tickets"
                        className="text-sm font-medium hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        My Tickets
                    </Link>
                    <Link
                        href="/admin/dashboard"
                        className="text-sm font-medium hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Organizer
                    </Link>
                    <Link
                        href="/admin/create"
                        className="text-sm font-medium hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Create Event
                    </Link>
                    <ConnectButton />
                </div>
            )}
        </nav>
    )
}

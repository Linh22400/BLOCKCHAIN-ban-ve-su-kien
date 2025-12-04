import Link from "next/link"
import { Ticket } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                                <Ticket className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-gradient">NFT Tix</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            The future of event ticketing. Secure, transparent, and fair.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/events" className="hover:text-primary">Browse Events</Link></li>
                            <li><Link href="/marketplace" className="hover:text-primary">Marketplace</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-primary">How it Works</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/help" className="hover:text-primary">Help Center</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Connect</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary">Twitter</a></li>
                            <li><a href="#" className="hover:text-primary">Discord</a></li>
                            <li><a href="#" className="hover:text-primary">GitHub</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} NFT Tix. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

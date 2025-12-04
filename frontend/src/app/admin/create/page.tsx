"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function CreateEventPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Mock submission
        setTimeout(() => {
            alert("Event Created Successfully (Mock)")
            setIsLoading(false)
        }, 1500)
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-4xl font-bold mb-8">Create New Event</h1>

            <div className="bg-card border border-white/10 rounded-xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Event Title</label>
                        <Input placeholder="e.g. Neon Nights Music Festival" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Time</label>
                            <Input type="time" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input placeholder="e.g. Cyber City Arena" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Total Tickets</label>
                            <Input type="number" min="1" placeholder="1000" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Price (ETH)</label>
                            <Input type="number" step="0.001" min="0" placeholder="0.05" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Image URL</label>
                        <Input placeholder="https://..." />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe your event..."
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" variant="gradient" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Event"}
                    </Button>
                </form>
            </div>
        </div>
    )
}

import { Button } from "@/components/ui/button";
import { HomeEventCard } from "@/components/events/HomeEventCard";
import { EVENTS } from "@/lib/mockData";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80')] bg-cover bg-center opacity-10 z-[-1]" />
        <div className="container relative z-10 px-4 text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-gradient">Next Gen</span> Ticketing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure, transparent, and fair event ticketing powered by Blockchain technology.
            Say goodbye to scalpers and fake tickets.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/events">
              <Button size="lg" variant="gradient" className="gap-2">
                Explore Events <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/create">
              <Button size="lg" variant="outline">
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="container px-4 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Events</h2>
          <Link href="/events">
            <Button variant="ghost" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EVENTS.map((event) => (
            <HomeEventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}

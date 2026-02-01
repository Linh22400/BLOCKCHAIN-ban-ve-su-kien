"use client"

import { Button } from "@/components/ui/button";
import { HomeEventCard } from "@/components/events/HomeEventCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useGetAllEvents } from "@/hooks/useEventFactory";
import { useEffect, useState } from "react";
import { useEventDetails } from "@/hooks/useEventTicket";

// Component to display single real event
function RealEventCard({ eventAddress, index }: { eventAddress: string; index: number }) {
  const { eventName, eventDate, eventLocation, ticketPrice } = useEventDetails(eventAddress);

  // Show loading skeleton while data is being fetched
  if (!eventName) {
    return (
      <div className="h-[350px] rounded-xl bg-white/5 animate-pulse" />
    );
  }

  // Format data for HomeEventCard
  const eventData = {
    id: index,
    title: eventName || "Event",
    date: eventDate ? new Date(Number(eventDate) * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : "TBA",
    location: eventLocation || "Location TBA",
    price: ticketPrice ? `${(Number(ticketPrice) / 1e18).toFixed(3)} ETH` : "Free",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80" // Default event image
  };

  return <HomeEventCard event={eventData} />;
}

export default function Home() {
  const { eventAddresses, isLoading } = useGetAllEvents();
  // Show first 4 events
  const featuredEvents = eventAddresses?.slice(0, 4) || [];

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80')] bg-cover bg-center opacity-10 z-[-1]" />
        <div className="container relative z-10 px-4 text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Hệ Thống Vé <span className="text-gradient">Thế Hệ Mới</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hệ thống vé sự kiện an toàn, minh bạch và công bằng được hỗ trợ bởi công nghệ Blockchain.
            Nói lời tạm biệt với nạn vé giả và người đầu cơ vé.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/events">
              <Button size="lg" variant="gradient" className="gap-2">
                Khám Phá Sự Kiện <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/create">
              <Button size="lg" variant="outline">
                Tạo Sự Kiện
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="container px-4 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Sự Kiện Nổi Bật</h2>
          <Link href="/events">
            <Button variant="ghost" className="gap-2">
              Xem Tất Cả <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[350px] rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.map((address, index) => (
              <RealEventCard key={address} eventAddress={address} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-4">Chưa có sự kiện nào.</p>
            <Link href="/admin/create">
              <Button variant="outline">Tạo Sự Kiện Đầu Tiên</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

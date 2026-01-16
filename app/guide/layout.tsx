'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  MessageSquare,
  Settings,
  LogOut,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/guide/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Bookings",
    href: "/guide/bookings",
    icon: CalendarDays,
  },
  {
    title: "Availability",
    href: "/guide/availability",
    icon: MapPin, // Or Calendar, choosing MapPin for variety or CalendarClock
  },
  {
    title: "Profile & Listing",
    href: "/guide/profile",
    icon: User,
  },
  {
    title: "Messages",
    href: "/guide/messages",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/guide/settings",
    icon: Settings,
  },
];

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show sidebar on onboarding
  if (pathname.startsWith("/guide/onboarding")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r bg-muted/10">
        <div className="flex flex-col h-full py-4">
          <div className="px-6 py-2">
            <h2 className="text-lg font-semibold tracking-tight">Guide Portal</h2>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-muted"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="px-3 py-2">
            {/* Bottom actions if any */}
          </div>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}

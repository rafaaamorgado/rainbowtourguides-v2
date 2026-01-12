"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Calendar,
  MessageSquare,
  User,
  Settings,
  Menu,
  X,
  MapPin,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarProps {
  profile: {
    id: string;
    full_name: string; // ⚠️ full_name, not display_name
    avatar_url: string | null;
    role: string;
  };
}

const navigationLinks = [
  {
    name: "Dashboard",
    href: "/traveler/dashboard",
    icon: Home,
  },
  {
    name: "My Bookings",
    href: "/traveler/bookings",
    icon: Calendar,
  },
  {
    name: "Messages",
    href: "/traveler/messages",
    icon: MessageSquare,
  },
  {
    name: "Saved Guides",
    href: "/traveler/saved",
    icon: User,
  },
  {
    name: "Settings",
    href: "/traveler/settings",
    icon: Settings,
  },
];

export function TravelerSidebar({ profile }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    // TODO: Implement sign out
    router.push("/auth/sign-out");
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">RT</span>
          </div>
          <span className="font-bold text-ink">Rainbow Tour Guides</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-ink" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200",
          "transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RT</span>
                </div>
                <span className="font-bold text-ink text-sm">Rainbow Tours</span>
              </Link>

              {/* Close button (mobile only) */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-ink-soft" />
              </button>
            </div>

            {/* User Info Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pride-lilac to-pride-mint flex-shrink-0">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name} {/* ⚠️ full_name, not display_name */}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold text-lg">
                      {profile.full_name.charAt(0).toUpperCase()} {/* ⚠️ full_name, not display_name */}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">
                    {profile.full_name} {/* ⚠️ full_name, not display_name */}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-1 text-xs bg-slate-100 text-slate-700"
                  >
                    Traveler
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                    isActive
                      ? "bg-brand/10 text-brand font-semibold"
                      : "text-ink-soft hover:bg-slate-100 hover:text-ink"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{link.name}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Bottom Section */}
          <div className="p-4 space-y-2">
            {/* Browse Cities */}
            <Link
              href="/cities"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-soft hover:bg-slate-100 hover:text-ink transition-all"
            >
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span>Browse Cities</span>
            </Link>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-soft hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}


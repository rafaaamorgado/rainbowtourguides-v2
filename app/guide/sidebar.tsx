'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  Calendar,
  ClipboardCheck,
  User,
  DollarSign,
  Menu,
  X,
  MapPin,
  LogOut,
  ChevronRight,
  Clock,
  MessageSquare,
  Star,
  Settings,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarProps {
  profile: {
    id: string;
    full_name: string; // ⚠️ full_name, not display_name
    avatar_url: string | null;
    role: string;
  };
  guide: {
    status: string;
  } | null;
  pendingBookingsCount: number;
}

export function GuideSidebar({
  profile,
  guide,
  pendingBookingsCount,
}: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isApproved = guide?.status === 'approved';

  const navigationLinks = [
    {
      name: 'Dashboard',
      href: '/guide/dashboard',
      icon: Home,
      show: true,
    },
    {
      name: 'Bookings',
      href: '/guide/bookings',
      icon: Calendar,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
      show: true,
    },
    {
      name: 'Availability',
      href: '/guide/availability',
      icon: Clock,
      show: true,
    },
    {
      name: 'Pricing',
      href: '/guide/pricing',
      icon: DollarSign,
      show: true,
    },
    {
      name: 'Photos',
      href: '/guide/photos',
      icon: ImageIcon,
      show: true,
    },
    {
      name: 'Messages',
      href: '/guide/messages',
      icon: MessageSquare,
      show: true,
    },
    {
      name: 'Reviews',
      href: '/guide/reviews',
      icon: Star,
      show: true,
    },
    {
      name: 'Onboarding',
      href: '/guide/onboarding',
      icon: ClipboardCheck,
      show: !isApproved, // Only show if not approved
    },
    {
      name: 'Profile',
      href: '/guide/profile',
      icon: User,
      show: true,
    },
    {
      name: 'Payouts',
      href: '/guide/payouts',
      icon: DollarSign, // Using DollarSign again or a different one? Payouts usually use DollarSign. Pricing could use Tag? Or CreditCard. Let's stick to DollarSign for Payouts. Maybe Tag for Pricing? Or just DollarSign is fine. But duplicate icons might be confusing. Let's use Tag for Pricing or similar. Actually, DollarSign is fine for both generally, but let's see. Payouts is definitely DollarSign. Pricing... maybe 'Coins'? Let's keep existing DollarSign for Payouts, and maybe change Pricing to something else if I can import it. But for now I will use DollarSign for Payouts (as it was) and... wait, existing code has Payouts at the end. I will reuse that.
      show: true,
    },
    {
      name: 'Settings',
      href: '/guide/settings',
      icon: Settings,
      show: true,
    },
  ];

  const handleSignOut = async () => {
    router.push('/auth/sign-out');
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
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
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
                <span className="font-bold text-ink text-sm">
                  Rainbow Tours
                </span>
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
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pride-mint to-pride-amber flex-shrink-0">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold text-lg">
                      {profile.full_name.charAt(0).toUpperCase()}
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
                    className="mt-1 text-xs bg-emerald-100 text-emerald-700"
                  >
                    Guide
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationLinks
              .filter((link) => link.show)
              .map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + '/');
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative',
                      isActive
                        ? 'bg-brand/10 text-brand font-semibold'
                        : 'text-ink-soft hover:bg-slate-100 hover:text-ink',
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{link.name}</span>
                    {link.badge !== undefined && (
                      <Badge className="bg-brand text-white border-0 text-xs">
                        {link.badge}
                      </Badge>
                    )}
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                );
              })}
          </nav>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Bottom Section */}
          <div className="p-4 space-y-2">
            {/* Browse as Traveler */}
            <Link
              href="/cities"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-soft hover:bg-slate-100 hover:text-ink transition-all"
            >
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span>Browse as Traveler</span>
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

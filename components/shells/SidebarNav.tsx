'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  MapPin,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  show?: boolean;
};

interface SidebarNavProps {
  items: SidebarNavItem[];
  brandHref?: string;
  brandLabel?: string;
  brandInitials?: string;
  brandGradientClassName?: string;
  mobileHeaderLabel?: string;
  userName?: string;
  userBadge?: string;
  userBadgeClassName?: string;
  userAvatarUrl?: string | null;
  avatarGradientClassName?: string;
  browseHref?: string;
  browseLabel?: string;
  browseIcon?: LucideIcon;
  signOutHref?: string;
}

export function SidebarNav({
  items,
  brandHref = "/",
  brandLabel = "Rainbow Tour Guides",
  brandInitials = "RT",
  brandGradientClassName = "from-brand to-pink-500",
  mobileHeaderLabel,
  userName = "Guide Account",
  userBadge,
  userBadgeClassName,
  userAvatarUrl,
  avatarGradientClassName = "from-pride-lilac to-pride-mint",
  browseHref = "/cities",
  browseLabel = "Browse Cities",
  browseIcon: BrowseIcon = MapPin,
  signOutHref = "/auth/sign-out",
}: SidebarNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    if (signOutHref) {
      router.push(signOutHref);
    }
  };

  const initial = userName?.charAt(0).toUpperCase() || "G";

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href={brandHref} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm",
              brandGradientClassName,
            )}
          >
            <span>{brandInitials}</span>
          </div>
          <span className="font-bold text-ink">{mobileHeaderLabel ?? brandLabel}</span>
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
          className="lg:hidden fixed top-20 left-0 right-0 bottom-0 bg-black/50 z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-20 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200",
          "transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            {/* User Info Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={cn(
                  "relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br",
                  avatarGradientClassName,
                )}>
                  {userAvatarUrl ? (
                    <Image
                      src={userAvatarUrl}
                      alt={userName || "User avatar"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold text-lg">
                      {initial}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">
                    {userName}
                  </p>
                  {userBadge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "mt-1 text-xs bg-slate-100 text-slate-700",
                        userBadgeClassName,
                      )}
                    >
                      {userBadge}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {items
              .filter((link) => link.show ?? true)
              .map((link) => {
                const isActive =
                  pathname === link.href || pathname.startsWith(link.href + "/");
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative",
                      isActive
                        ? "bg-brand/10 text-brand font-semibold"
                        : "text-ink-soft hover:bg-slate-100 hover:text-ink",
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{link.title}</span>
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
            {browseHref && (
              <Link
                href={browseHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-soft hover:bg-slate-100 hover:text-ink transition-all"
              >
                <BrowseIcon className="h-5 w-5 flex-shrink-0" />
                <span>{browseLabel}</span>
              </Link>
            )}

            {signOutHref && (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-soft hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}

export default SidebarNav;

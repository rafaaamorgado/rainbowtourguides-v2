'use client';

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  MessageSquare,
  Settings,
  MapPin,
} from "lucide-react";
import DashboardShell from "@/components/shells/DashboardShell";
import { SidebarNav, type SidebarNavItem } from "@/components/shells/SidebarNav";

const sidebarNavItems: SidebarNavItem[] = [
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
    icon: MapPin,
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

export default function GuideLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Don't show sidebar on onboarding
  if (pathname.startsWith("/guide/onboarding")) {
    return <>{children}</>;
  }

  return (
    <DashboardShell
      sidebar={
        <SidebarNav
          items={sidebarNavItems}
          brandHref="/"
          brandLabel="Rainbow Tours"
          mobileHeaderLabel="Rainbow Tour Guides"
          userName="Guide"
          userBadge="Guide"
          userBadgeClassName="bg-emerald-100 text-emerald-700"
          avatarGradientClassName="from-pride-mint to-pride-amber"
          browseHref=""
          signOutHref="/auth/sign-out"
        />
      }
    >
      {children}
    </DashboardShell>
  );
}

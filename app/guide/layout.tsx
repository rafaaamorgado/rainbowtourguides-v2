import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { GuideSidebar } from "./sidebar";
import type { Database } from "@/types/database";

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

  if (!user) {
    redirect("/auth/sign-in?redirect=/guide/dashboard");
  }

  // Get user profile with role
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  // Check if profile exists
  if (!profile || profileError) {
    redirect("/auth/sign-in");
  }

  // Redirect traveler to their dashboard
  if (profile.role === "traveler") {
    redirect("/traveler/dashboard");
  }

  // Only allow guides and admins
  if (profile.role !== "guide" && profile.role !== "admin") {
    redirect("/");
  }

  // Get guide record and pending bookings count
  const { data: guideData } = await supabase
    .from("guides")
    .select("*")
    .eq("id", user.id)
    .single();

  const guide = guideData as Guide | null;

  // Count pending bookings (if needed)
  const { count: pendingBookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("guide_id", user.id)
    .eq("status", "pending");

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

'use client';

import {
  LayoutDashboard,
  ShieldCheck,
  Calendar,
  Users,
  Globe,
} from 'lucide-react';
import { SidebarNav, type SidebarNavItem } from '@/components/shells/SidebarNav';

interface AdminSidebarProps {
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  pendingGuidesCount: number;
}

const adminNavItems: SidebarNavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Guides',
    href: '/admin/guides',
    icon: ShieldCheck,
  },
  {
    title: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
];

export function AdminSidebar({ profile, pendingGuidesCount }: AdminSidebarProps) {
  const items: SidebarNavItem[] = adminNavItems.map((item) => {
    if (item.href === '/admin/guides' && pendingGuidesCount > 0) {
      return { ...item, badge: pendingGuidesCount };
    }
    return item;
  });

  return (
    <SidebarNav
      items={items}
      brandHref="/admin"
      brandLabel="Admin Console"
      brandInitials="AC"
      brandGradientClassName="from-red-600 to-rose-500"
      mobileHeaderLabel="Admin Console"
      userName={profile.full_name || 'Admin'}
      userBadge="Administrator"
      userBadgeClassName="bg-red-100 text-red-700"
      userAvatarUrl={profile.avatar_url}
      avatarGradientClassName="from-red-500 to-rose-400"
      browseHref="/cities"
      browseLabel="Browse Site"
      browseIcon={Globe}
      signOutHref="/auth/sign-out"
    />
  );
}

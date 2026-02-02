import {
  Calendar,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  User2,
  Users,
} from 'lucide-react';

export const adminMenuItems = [
  {
    key: 'admin',
    href: '/admin',
    label: 'Admin Dashboard',
    icon: LayoutDashboard,
  },
  {
    key: 'users',
    href: '/admin/users',
    label: 'Manage Users',
    icon: Users,
  },
  {
    key: 'guides',
    href: '/admin/guides',
    label: 'Manage Guides',
    icon: Shield,
  },
  {
    key: 'admin-settings',
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export const getUserMenuItems = (basePath: string) => [
  {
    key: 'dashboard',
    href: `${basePath}/dashboard`,
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    key: 'messages',
    href: `${basePath}/messages`,
    label: 'Messages',
    icon: MessageSquare,
  },
  {
    key: 'bookings',
    href: `${basePath}/bookings`,
    label: 'Bookings',
    icon: Calendar,
  },
  {
    key: 'settings',
    href: `${basePath}/settings`,
    label: 'Settings',
    icon: Settings,
  },
  {
    key: 'profile',
    href: `${basePath}/profile`,
    label: 'Profile',
    icon: User2,
  },
];

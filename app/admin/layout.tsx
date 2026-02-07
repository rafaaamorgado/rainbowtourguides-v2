'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Guide Verification',
    href: '/admin/guides',
    icon: ShieldCheck,
  },
  {
    title: 'Bookings',
    href: '/admin/bookings',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r bg-muted/30">
        <div className="flex flex-col h-full py-4">
          <div className="px-6 py-2">
            <h2 className="text-lg font-bold tracking-tight text-red-600">
              Admin Console
            </h2>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {adminNavItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'light' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  pathname === item.href && 'bg-muted',
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
        </div>
      </aside>
      <main className="flex-1 p-8 bg-background">{children}</main>
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from './site-footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on dashboard pages (traveler, guide, admin)
  const isDashboard = 
    pathname?.startsWith('/traveler') || 
    pathname?.startsWith('/guide') || 
    pathname?.startsWith('/admin');
  
  if (isDashboard) {
    return null;
  }
  
  return <SiteFooter />;
}

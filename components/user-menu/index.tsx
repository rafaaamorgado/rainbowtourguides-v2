'use client';

import {
  DropdownMenu as Dropdown,
  DropdownMenuTrigger as DropdownTrigger,
  DropdownMenuContent,
  DropdownMenuItem as DropdownItem,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { useUserMenu } from './lib/useUserMenu';
import { adminMenuItems, getUserMenuItems } from './model/menuItems';
import { UserMenuTrigger } from './ui/UserMenuTrigger';
import { AuthButtons } from './ui/AuthButtons';

export function UserMenu() {
  const {
    session,
    profile,
    loading,
    supabaseConfigured,
    isAdmin,
    basePath,
    displayName,
    initials,
    avatarUrl,
    handleSignOut,
  } = useUserMenu();

  if (!supabaseConfigured) return null;

  if (loading) {
    return <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />;
  }

  if (!session) {
    return <AuthButtons />;
  }

  const menuItems = isAdmin ? adminMenuItems : getUserMenuItems(basePath);

  return (
    <Dropdown>
      <DropdownTrigger>
        <button
          type="button"
          className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:opacity-80 cursor-pointer select-none"
          aria-label="User menu"
        >
          <UserMenuTrigger
            displayName={displayName}
            initials={initials}
            avatarUrl={avatarUrl}
          />
        </button>
      </DropdownTrigger>
      <DropdownMenuContent aria-label="User menu" className="w-56">
        {/* User Info */}
        <DropdownItem
          key="user-info"
          isReadOnly
          className="opacity-100 cursor-default hover:bg-transparent font-normal"
          textValue="User info"
        >
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {profile?.role || 'traveler'}
            </p>
          </div>
        </DropdownItem>

        {/* Separator */}
        <DropdownItem
          key="separator-1"
          isReadOnly
          className="h-px p-0 my-1 bg-divider cursor-default hover:bg-transparent"
          textValue="separator"
        >
          <div className="w-full h-px bg-divider" />
        </DropdownItem>

        {/* Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownItem
              key={item.key}
              href={item.href}
              className="flex w-full items-center gap-2 flex-row"
              textValue={item.label}
            >
              <div className="flex w-full items-center gap-2 flex-row">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            </DropdownItem>
          );
        })}

        {/* Separator */}
        <DropdownItem
          key="separator-2"
          isReadOnly
          className="h-px p-0 my-1 bg-divider cursor-default hover:bg-transparent"
          textValue="separator"
        >
          <div className="w-full h-px bg-divider" />
        </DropdownItem>

        {/* Logout */}
        <DropdownItem
          key="logout"
          onPress={handleSignOut}
          className="cursor-pointer text-red-600 flex items-center gap-2 flex-row"
          textValue="Logout"
        >
          <div className="flex w-full items-center gap-2 flex-row">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </div>
        </DropdownItem>
      </DropdownMenuContent>
    </Dropdown>
  );
}

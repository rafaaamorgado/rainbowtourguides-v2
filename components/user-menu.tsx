'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    User2,
} from 'lucide-react';
import {
    createSupabaseBrowserClient,
    isSupabaseConfiguredOnClient,
} from '@/lib/supabase-browser';
import { getAvatarUrl } from '@/lib/storage-helpers';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function UserMenu() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const supabaseConfigured = isSupabaseConfiguredOnClient();

    useEffect(() => {
        if (!supabaseConfigured) {
            setLoading(false);
            return;
        }

        const supabase = createSupabaseBrowserClient();
        if (!supabase) {
            setLoading(false);
            return;
        }

        const fetchProfile = async (userId: string) => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, role, full_name, avatar_url')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('UserMenu: failed to load profile', error);
                setProfile(null);
                return;
            }

            setProfile(data as Profile);
        };

        const syncSession = async () => {
            const { data } = await supabase.auth.getSession();
            const nextSession = data.session ?? null;
            setSession(nextSession);

            const userId = nextSession?.user?.id;
            if (userId) {
                await fetchProfile(userId);
            } else {
                setProfile(null);
            }

            setLoading(false);
        };

        syncSession();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, nextSession) => {
                setSession(nextSession ?? null);
                const userId = nextSession?.user?.id;
                if (userId) {
                    await fetchProfile(userId);
                } else {
                    setProfile(null);
                }
            },
        );

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, [supabaseConfigured]);

    const handleSignOut = async () => {
        const supabase = createSupabaseBrowserClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        setSession(null);
        setProfile(null);
        router.push('/');
        router.refresh();
    };

    const resolvedRole = profile?.role === 'guide' ? 'guide' : 'traveler'; // TODO: handle admin shell when it exists
    const basePath = resolvedRole === 'guide' ? '/guide' : '/traveler';

    const displayName =
        profile?.full_name ||
        (session?.user?.user_metadata?.full_name as string | undefined) ||
        session?.user?.email ||
        'User';

    const initials = useMemo(() => {
        const parts = displayName.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) {
            return 'U';
        }
        const letters = parts.map((part) => part.charAt(0)).join('');
        return letters.slice(0, 2).toUpperCase();
    }, [displayName]);

    const rawAvatar =
        profile?.avatar_url ||
        (session?.user?.user_metadata?.avatar_url as string | undefined) ||
        (session?.user?.user_metadata?.picture as string | undefined) ||
        null;

    const avatarUrl = getAvatarUrl(rawAvatar);

    if (loading) {
        return <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />;
    }

    if (!supabaseConfigured) {
        return null;
    }

    if (!session) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link
                        href="/auth/sign-in"
                        className="text-sm font-medium text-slate-700 hover:text-brand"
                    >
                        Sign in
                    </Link>
                </Button>
                <Button
                    asChild
                    className="bg-brand hover:bg-brand-dark text-white rounded-full px-5"
                >
                    <Link href="/auth/sign-up?role=traveler">Sign up</Link>
                </Button>
            </div>
        );
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:opacity-80"
                    aria-label="User menu"
                >
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                        <AvatarFallback className="bg-brand text-white text-sm font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session.user?.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                            {profile?.role || 'traveler'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`${basePath}/dashboard`} className="flex w-full items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`${basePath}/messages`} className="flex w-full items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Messages</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`${basePath}/bookings`} className="flex w-full items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Bookings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`${basePath}/settings`} className="flex w-full items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`${basePath}/profile`} className="flex w-full items-center gap-2">
                        <User2 className="h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

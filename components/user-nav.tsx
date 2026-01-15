'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import {
    createSupabaseBrowserClient,
    isSupabaseConfiguredOnClient,
} from '@/lib/supabase-browser';
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
    User as UserIcon,
    LayoutDashboard,
    Settings,
    Calendar,
    MessageSquare,
    LogOut
} from 'lucide-react';

interface UserProfile {
    id: string;
    role: 'traveler' | 'guide' | 'admin';
    full_name: string | null;
    avatar_url: string | null;
}

export function UserNav() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const isConfigured = isSupabaseConfiguredOnClient();

    useEffect(() => {
        if (!isConfigured) {
            console.log('UserNav: Supabase not configured');
            setLoading(false);
            return;
        }

        const supabase = createSupabaseBrowserClient();
        if (!supabase) {
            console.log('UserNav: Could not create Supabase client');
            setLoading(false);
            return;
        }

        const getUser = async () => {
            console.log('UserNav: Fetching user...');
            try {
                const { data: { user } } = await supabase.auth.getUser();
                console.log('UserNav: User:', user);
                console.log('UserNav: User metadata:', user?.user_metadata);
                setUser(user);

                if (user) {
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('id, role, full_name, avatar_url')
                        .eq('id', user.id)
                        .single();

                    console.log('UserNav: Profile data:', profileData);
                    if (profileError && process.env.NODE_ENV === 'development') {
                        console.error('UserNav: Profile error:', profileError);
                    }
                    setProfile(profileData as UserProfile | null);
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('UserNav: Failed to fetch user or profile:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('UserNav: Auth state changed:', event, session?.user?.email);
                setUser(session?.user ?? null);
                if (session?.user) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('id, role, full_name, avatar_url')
                        .eq('id', session.user.id)
                        .single();
                    console.log('UserNav: Profile data on auth change:', profileData);
                    setProfile(profileData as UserProfile | null);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [isConfigured]);

    const handleSignOut = async () => {
        const supabase = createSupabaseBrowserClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        router.push('/');
        router.refresh();
    };

    const getDashboardPath = () => {
        if (profile?.role === 'admin') return '/admin';
        if (profile?.role === 'guide') return '/guide/dashboard';
        return '/traveler/dashboard';
    };

    const getBookingsPath = () => {
        if (profile?.role === 'guide') return '/guide/bookings';
        return '/traveler/bookings';
    };

    const getMessagesPath = () => {
        if (profile?.role === 'guide') return '/guide/messages';
        return '/traveler/messages';
    };

    const getProfilePath = () => {
        if (profile?.role === 'guide') return '/guide/profile';
        return '/traveler/profile';
    };

    const getSettingsPath = () => {
        if (profile?.role === 'guide') return '/guide/settings';
        return '/traveler/settings';
    };

    // Loading state
    if (loading) {
        return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />;
    }

    // Not configured
    if (!isConfigured) {
        return null;
    }

    // Not logged in - show auth buttons
    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/auth/sign-in')}
                    className="text-sm font-medium text-slate-700 hover:text-brand"
                >
                    Sign In
                </Button>
                <Button
                    onClick={() => router.push('/auth/sign-up?role=traveler')}
                    className="bg-brand hover:bg-brand-dark text-white rounded-full px-5"
                >
                    Sign Up
                </Button>
            </div>
        );
    }

    // Logged in - show avatar dropdown
    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.charAt(0).toUpperCase() || 'U';

    // Get avatar URL from multiple possible sources
    const avatarUrl =
        profile?.avatar_url ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||  // Google uses 'picture'
        undefined;

    console.log('UserNav: Rendering avatar with URL:', avatarUrl);
    console.log('UserNav: Initials:', initials);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:opacity-80"
                >
                    <Avatar className="h-9 w-9">
                        <AvatarImage
                            src={avatarUrl}
                            alt={profile?.full_name || 'User'}
                        />
                        <AvatarFallback className="bg-brand text-white text-sm font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                            {profile?.role || 'traveler'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(getDashboardPath())} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(getProfilePath())} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(getBookingsPath())} className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(getMessagesPath())} className="cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(getSettingsPath())} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

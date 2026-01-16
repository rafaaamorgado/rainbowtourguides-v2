'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { ProfileRole } from '@/types/database';

interface RoleGateProps {
    children: React.ReactNode;
    allowedRoles: ProfileRole[];
    fallbackUrl?: string; // Where to redirect if denied
}

export function RoleGate({ children, allowedRoles, fallbackUrl = '/' }: RoleGateProps) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createSupabaseBrowserClient();
            if (!supabase) {
                setIsAuthorized(false);
                router.replace('/auth/sign-in');
                return;
            }
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setIsAuthorized(false);
                router.replace('/auth/sign-in'); // Or fallbackUrl
                return;
            }

            // Check profile role
            const { data: profile } = await (supabase
                .from('profiles') as any)
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile && allowedRoles.includes(profile.role as ProfileRole)) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                router.replace(fallbackUrl);
            }
        };

        checkAuth();
    }, [allowedRoles, fallbackUrl, router]);

    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-muted-foreground">Checking access...</div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Or show a "Access Denied" message if not redirecting
    }

    return <>{children}</>;
}

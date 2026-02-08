
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;

        if (session?.user) {
            // Skip check if already on onboarding or specific api routes
            if (pathname?.startsWith('/onboarding') || pathname?.startsWith('/api')) {
                setChecking(false);
                return;
            }

            fetchApi('/api/profile')
                .then((profile) => {
                    console.log("OnboardingGuard profile check:", profile);
                    if (!profile || !profile.onboardingCompleted) {
                        // Double check if we are already on onboarding to avoid loop (though regex above handles it)
                        if (!pathname.startsWith('/onboarding')) {
                            router.push('/onboarding');
                        }
                    }
                })
                .catch(() => {
                    // Ignore error, maybe just let them proceed or retry
                })
                .finally(() => setChecking(false));
        } else {
            setChecking(false);
        }
    }, [session, status, pathname, router]);

    if (status === 'loading' || checking) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Or a nice spinner
    }

    return <>{children}</>;
}

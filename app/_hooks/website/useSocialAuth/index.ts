import { useCallback } from 'react';

export function useSocialAuth() {
    const loginWithProvider = useCallback(async (provider: 'google' | 'github') => {
        // Implementation would typically use Supabase or NextAuth
        console.log(`Logging in with ${provider}`);
        window.location.href = `/api/website/auth/social?provider=${provider}`;
    }, []);

    return { loginWithProvider };
}

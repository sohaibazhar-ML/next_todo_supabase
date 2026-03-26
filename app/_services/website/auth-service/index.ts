import { api } from '@/services/website/apiClient';
import { UserProfile, SignUpFormData } from '@/website/types';

import { LoginCredentials } from '@/admin/hooks/useAuth';

export const authService = {
    login: (credentials: LoginCredentials) => 
        api.post<{ user: UserProfile, token: string }>('/api/website/auth/login', credentials),
    
    signup: (data: SignUpFormData) => 
        api.post<{ user: UserProfile }>('/api/website/auth/signup', data),
    
    signout: () => 
        api.post('/api/website/auth/signout'),
    
    resetPassword: (email: string) => 
        api.post('/api/website/auth/reset-password', { email }),

    updatePassword: async (supabase: { auth: { updateUser: (data: { password?: string }) => Promise<{ error: { message: string } | null }> } }, password: string) => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(error.message);
        return { success: true };
    }
};

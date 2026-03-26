import { api } from '@/services/admin/apiClient';
import { API_ROUTES } from '@/constants/routes';
import { UserProfile, SignUpFormData } from '@/admin/types';

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
};

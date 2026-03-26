import { api } from '@/services/apiClient';
import { API_ROUTES } from '@/constants/routes';
import { UserProfile, SignUpFormData } from '@/types';

import { LoginCredentials } from '@/hooks/useAuth';

export const authService = {
    login: (credentials: LoginCredentials) => 
        api.post<{ user: UserProfile, token: string }>('/api/auth/login', credentials),
    
    signup: (data: SignUpFormData) => 
        api.post<{ user: UserProfile }>('/api/auth/signup', data),
    
    signout: () => 
        api.post('/api/auth/signout'),
    
    resetPassword: (email: string) => 
        api.post('/api/auth/reset-password', { email }),
};

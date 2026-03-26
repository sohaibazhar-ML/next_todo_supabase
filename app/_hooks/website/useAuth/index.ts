import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/website/auth-service';
import { SignUpFormData } from '@/website/types';

export interface LoginCredentials {
    email: string;
    password: string;
}

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    });
};

export const useSignupMutation = () => {
    return useMutation({
        mutationFn: (data: SignUpFormData) => authService.signup(data),
    });
};

export const useSignoutMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => authService.signout(),
        onSuccess: () => {
            queryClient.clear();
        },
    });
};

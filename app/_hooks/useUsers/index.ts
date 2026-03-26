import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user-service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { UserProfile } from '@/types';

export const useUsers = (params?: Record<string, unknown>) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.USERS, params],
        queryFn: () => userService.getAll(params),
    });
};

export const useUser = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.USERS, id],
        queryFn: () => userService.getById(id),
        enabled: !!id,
    });
};

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<UserProfile> }) => 
            userService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN.USERS] });
        },
    });
};

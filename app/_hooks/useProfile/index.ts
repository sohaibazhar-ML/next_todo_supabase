import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profile-service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { UserProfile } from '@/types';

export const useProfile = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.WEBSITE.USER_PROFILE],
        queryFn: () => profileService.getCurrent(),
    });
};

export const useUpdateProfileMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: Partial<UserProfile>) => profileService.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WEBSITE.USER_PROFILE] });
        },
    });
};

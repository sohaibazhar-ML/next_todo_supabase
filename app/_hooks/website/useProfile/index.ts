import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/website/profile-service';
import { QUERY_KEYS } from '@/website/constants/queryKeys';
import { UserProfile } from '@/website/types';

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

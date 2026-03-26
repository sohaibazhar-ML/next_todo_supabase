import { useQuery } from '@tanstack/react-query';
import { adminSettingsService } from '@/services/admin/admin-settings-service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { createClient } from '@/lib/supabase/client';

export const useAdminProfile = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.SETTINGS, 'current-profile'],
        queryFn: async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');
            return adminSettingsService.getAdminProfile(user.id);
        },
    });
};

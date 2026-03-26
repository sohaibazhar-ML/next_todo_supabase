export const QUERY_KEYS = {
    ADMIN: {
        USERS: 'admin_users',
        DOCUMENTS: 'admin_documents',
        DOWNLOAD_LOGS: 'admin_download_logs',
        REPORTS: 'admin_reports',
        STATS: 'admin_stats',
        SETTINGS: 'admin_settings',
    },
    WEBSITE: {
        USER_PROFILE: 'user_profile',
    },
    profiles: {
        all: ['profiles'],
        lists: () => [...QUERY_KEYS.profiles.all, 'list'],
        byUserId: (id: string) => [...QUERY_KEYS.profiles.all, 'detail', id],
    },
    users: {
        all: ['users'],
        lists: () => [...QUERY_KEYS.users.all, 'list'],
        byUserId: (id: string) => [...QUERY_KEYS.users.all, 'detail', id],
    },
};

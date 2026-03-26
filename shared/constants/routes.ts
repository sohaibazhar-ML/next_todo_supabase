export const ROUTES = {
    WEBSITE: {
        HOME: '/',
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signup',
        PROFILE: '/profile',
    },
    ADMIN: {
        DASHBOARD: '/admin',
        USERS: '/admin#/users',
        DOCUMENTS: '/admin#/documents',
        DOWNLOAD_LOGS: '/admin#/download_logs',
        REPORTS: '/admin#/reports',
        SETTINGS: '/admin#/settings',
    },
};

export const API_ROUTES = {
    ADMIN: (resource: string) => `/api/admin/${resource}`,
    DOCUMENTS: {
        UPLOAD: '/api/documents/upload',
        DOWNLOAD: (id: string) => `/api/documents/download?id=${id}`,
    },
    PROFILES: '/api/profiles',
};

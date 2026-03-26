export const STORAGE_BUCKETS = {
    DOCUMENTS: 'documents',
    PUBLIC: 'public',
    ASSETS: 'assets',
} as const;

export const STORAGE_CONFIG = {
    CACHE_CONTROL: '3600',
    UPSERT: false,
    SIGNED_URL_EXPIRY: 3600, // 1 hour in seconds
} as const;

import { createClient } from '@/lib/supabase/server'

/**
 * Creates a realistic Supabase mock client that matches real behavior
 */
export const createSupabaseMock = (options: {
    user?: { id: string; email: string } | null;
    session?: any | null;
    error?: any | null;
} = {}) => {
    const mockAuth = {
        getUser: jest.fn().mockResolvedValue({
            data: { user: options.user ?? null },
            error: options.error ?? null
        }),
        getSession: jest.fn().mockResolvedValue({
            data: { session: options.session ?? null },
            error: options.error ?? null
        }),
        exchangeCodeForSession: jest.fn().mockResolvedValue({
            data: { user: options.user ?? null, session: options.session ?? null },
            error: options.error ?? null
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        resend: jest.fn().mockResolvedValue({ error: null }),
        getUserById: jest.fn().mockResolvedValue({ data: { user: options.user ?? null }, error: null }),
        updateUser: jest.fn().mockResolvedValue({ data: { user: options.user ?? null }, error: null }),
    }

    const mockStorage: any = {
        from: jest.fn().mockReturnThis(),
        upload: jest.fn().mockResolvedValue({ data: { path: 'test.pdf' }, error: null }),
        download: jest.fn().mockResolvedValue({ data: new Blob(['test']), error: null }),
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'http://local/test.pdf' } })),
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'http://local/signed-url' }, error: null }),
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
    }

    const mockDb: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    }

    const client = {
        auth: mockAuth,
        storage: mockStorage,
        from: jest.fn().mockReturnValue(mockDb),
    }

    return client
}

/**
 * Helper to setup createClient mock globally for a test
 */
export const setupSupabaseMock = (mockClient: any) => {
    ;(createClient as jest.Mock).mockResolvedValue(mockClient)
}

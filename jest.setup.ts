import { prismaMock } from './app/_lib/__mocks__/prisma'

// Global mocks for environment
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    prisma: prismaMock,
}))

// Mock Supabase Server Client
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => ({
        auth: {
            getUser: jest.fn(),
            getSession: jest.fn(),
            exchangeCodeForSession: jest.fn(),
            signOut: jest.fn(),
            resend: jest.fn(),
        },
        storage: {
            from: jest.fn().mockReturnThis(),
            upload: jest.fn(),
            download: jest.fn(),
            createSignedUrl: jest.fn(),
            getPublicUrl: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockReturnThis(),
        })),
    })),
}))

// Mock Next.js Navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const username = searchParams.get('username')

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 })
        }

        // Prisma bypasses RLS, so this lookup is safe for unauthenticated users
        const profile = await prisma.profiles.findUnique({
            where: { username },
            select: { email: true }
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        return NextResponse.json({ email: profile.email })
    } catch (error) {
        console.error('Error resolving username:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

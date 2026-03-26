import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

import { isErrorWithMessage } from '@/website/utils'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/website/constants'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const username = searchParams.get('username')

        if (!username) {
            return NextResponse.json({ error: ERROR_MESSAGES.USERNAME_REQUIRED }, { status: 400 })
        }

        // Prisma bypasses RLS, so this lookup is safe for unauthenticated users
        const profile = await prisma.profiles.findUnique({
            where: { username },
            select: { email: true }
        })

        if (!profile) {
            return NextResponse.json({ error: ERROR_MESSAGES.PROFILE_NOT_FOUND }, { status: 404 })
        }

        return NextResponse.json({ email: profile.email })
    } catch (error: unknown) {
        console.error(CONSOLE_MESSAGES.ERROR_RESOLVING_USERNAME, error)
        const errorMessage = isErrorWithMessage(error)
            ? error.message
            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}

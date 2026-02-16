import { NextResponse } from 'next/server'

/**
 * Interface for standard API response validation
 */
export interface ResponseContract<T = any> {
    status: number
    data?: T
    error?: string
}

/**
 * Creates a mock Request object for API handler tests
 */
export function createMockRequest(url: string, options: RequestInit = {}): Request {
    return new Request(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    })
}

/**
 * Utility to parse and validate a NextResponse
 */
export async function validateResponse<T>(response: Response): Promise<ResponseContract<T>> {
    const status = response.status
    let data: T | undefined
    let error: string | undefined

    try {
        const body = await response.json()
        if (status >= 400) {
            error = body.error || 'Unknown error'
        } else {
            data = body
        }
    } catch (e) {
        if (status >= 400) {
            error = 'Could not parse error response'
        }
    }

    return { status, data, error }
}

/**
 * Mocks global time
 */
export function mockTime(isoDate: string) {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(isoDate))
}

/**
 * Resets mocks and state (should be called in afterEach)
 */
export function cleanupMocks() {
    jest.clearAllMocks()
    jest.useRealTimers()
}

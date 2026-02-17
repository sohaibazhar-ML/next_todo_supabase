import { formatDate, formatDateTime, formatRelativeTime } from './date-utils'
import { formatFileSize, getFileType, getFileIconColor } from './file-utils'
import { serializeDocument, serializeDocuments, serializeProfile, serializeProfiles, serializeVersion, serializeVersions } from './serialization'

describe('Date Utils', () => {
    const testDate = new Date('2024-01-01T12:00:00Z')

    describe('formatDate', () => {
        it('should format date string correctly', () => {
            expect(formatDate(testDate)).toBe(testDate.toLocaleDateString())
        })
        it('should handle string input', () => {
            expect(formatDate('2024-01-01T12:00:00Z')).toBe(testDate.toLocaleDateString())
        })
    })

    describe('formatDateTime', () => {
        it('should format date time string correctly', () => {
            expect(formatDateTime(testDate)).toBe(testDate.toLocaleString())
        })
    })

    describe('formatRelativeTime', () => {
        beforeAll(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2024-01-01T13:00:00Z'))
        })

        afterAll(() => {
            jest.useRealTimers()
        })

        it('should return "just now" for recent times', () => {
            expect(formatRelativeTime(new Date('2024-01-01T12:59:50Z'))).toBe('just now')
        })

        it('should return minutes ago', () => {
            expect(formatRelativeTime(new Date('2024-01-01T12:55:00Z'))).toBe('5 minutes ago')
        })

        it('should return hours ago', () => {
            expect(formatRelativeTime(new Date('2024-01-01T11:00:00Z'))).toBe('2 hours ago')
        })

        it('should return days ago', () => {
            jest.setSystemTime(new Date('2024-01-05T13:00:00Z'))
            expect(formatRelativeTime(new Date('2024-01-01T13:00:00Z'))).toBe('4 days ago')
        })

        it('should return formatted date for > 7 days', () => {
            jest.setSystemTime(new Date('2024-02-01T13:00:00Z'))
            expect(formatRelativeTime(new Date('2024-01-01T13:00:00Z'))).toBe('1/1/2024')
        })
    })
})

describe('File Utils', () => {
    describe('formatFileSize', () => {
        it('should handle zero bytes', () => {
            expect(formatFileSize(0)).toBe('0 Bytes')
        })

        it('should format KB', () => {
            expect(formatFileSize(1024)).toBe('1 KB')
        })

        it('should format MB', () => {
            expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB')
        })
    })

    describe('getFileType', () => {
        it('should identify pdf', () => {
            expect(getFileType('test.pdf')).toBe('pdf')
        })
        it('should identify documents', () => {
            expect(getFileType('test.docx')).toBe('document')
            expect(getFileType('test.doc')).toBe('document')
        })
        it('should identify spreadsheets', () => {
            expect(getFileType('test.xlsx')).toBe('spreadsheet')
        })
        it('should identify others', () => {
            expect(getFileType('test.unknown')).toBe('other')
        })
    })

    describe('getFileIconColor', () => {
        it('should return correct colors', () => {
            expect(getFileIconColor('PDF')).toBe('text-red-600')
            expect(getFileIconColor('DOCX')).toBe('text-blue-600')
            expect(getFileIconColor('UNKNOWN')).toBe('text-gray-600')
        })
    })
})

describe('Serialization Utils', () => {
    describe('serializeDocument', () => {
        it('should convert BigInt file_size to number', () => {
            const doc = { id: '1', file_size: BigInt(100) } as any
            const result = serializeDocument(doc)
            expect(typeof result.file_size).toBe('number')
            expect(result.file_size).toBe(100)
        })

        it('should handle null/undefined file_size', () => {
            const doc = { id: '1' } as any
            const result = serializeDocument(doc)
            expect(result.file_size).toBe(0)
        })

        it('should handle number file_size', () => {
            const doc = { id: '1', file_size: 123 } as any
            const result = serializeDocument(doc)
            expect(result.file_size).toBe(123)
        })
    })

    describe('serializeDocuments', () => {
        it('should serialize array of documents', () => {
            const docs = [{ id: '1', file_size: BigInt(100) }, { id: '2', file_size: BigInt(200) }] as any
            const result = serializeDocuments(docs)
            expect(result[0].file_size).toBe(100)
            expect(result[1].file_size).toBe(200)
        })
    })

    describe('serializeProfile', () => {
        it('should convert Date objects to ISO strings', () => {
            const date = new Date('2024-01-01T12:00:00Z')
            const profile = {
                id: '1',
                created_at: date,
                updated_at: date,
                email_confirmed_at: date,
                role: 'user'
            } as any

            const result = serializeProfile(profile)
            expect(result.created_at).toBe(date.toISOString())
            expect(result.updated_at).toBe(date.toISOString())
            expect(result.email_confirmed_at).toBe(date.toISOString())
        })

        it('should handle null email_confirmed_at', () => {
            const profile = {
                id: '1',
                created_at: new Date(),
                updated_at: new Date(),
                email_confirmed_at: null
            } as any

            const result = serializeProfile(profile)
            expect(result.email_confirmed_at).toBeNull()
        })
    })

    describe('serializeProfiles', () => {
        it('should serialize array of profiles', () => {
            const date = new Date('2024-01-01T12:00:00Z')
            const profiles = [{
                id: '1',
                created_at: date,
                updated_at: date,
                email_confirmed_at: date,
                role: 'user'
            }] as any

            const result = serializeProfiles(profiles)
            expect(result[0].created_at).toBe(date.toISOString())
        })
    })

    describe('serializeVersion', () => {
        it('should convert BigInt exported_file_size to string', () => {
            const version = {
                id: '1',
                exported_file_size: BigInt(1234567890),
                created_at: new Date(),
                updated_at: new Date()
            } as any

            const result = serializeVersion(version)
            expect(typeof result.exported_file_size).toBe('string')
            expect(result.exported_file_size).toBe('1234567890')
        })

        it('should handle null exported_file_size', () => {
            const version = {
                id: '1',
                exported_file_size: null,
                created_at: new Date(),
                updated_at: new Date()
            } as any
            const result = serializeVersion(version)
            expect(result.exported_file_size).toBeNull()
        })

        it('should handle string dates (keep as is)', () => {
            const dateStr = '2024-01-01T12:00:00.000Z'
            const version = {
                id: '1',
                exported_file_size: null,
                created_at: dateStr,
                updated_at: dateStr
            } as any
            const result = serializeVersion(version)
            expect(result.created_at).toBe(dateStr)
            expect(result.updated_at).toBe(dateStr)
        })
    })

    describe('serializeVersions', () => {
        it('should serialize array of versions', () => {
            const versions = [{
                id: '1',
                exported_file_size: BigInt(123),
                created_at: new Date(),
                updated_at: new Date()
            }] as any

            const result = serializeVersions(versions)
            expect(result[0].exported_file_size).toBe('123')
        })
    })
})

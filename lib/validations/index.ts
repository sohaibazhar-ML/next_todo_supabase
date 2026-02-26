/**
 * Validations Index
 *
 * Central export point for all Zod validation schemas.
 */

export {
    profileCreateSchema,
    profileUpdateSchema,
    profileQuerySchema,
    type ProfileCreateInput,
    type ProfileUpdatePayload,
    type ProfileQueryParams,
} from './profile.schema'

export {
    documentCreateSchema,
    documentQuerySchema,
    type DocumentCreatePayload,
    type DocumentQueryParams,
} from './document.schema'

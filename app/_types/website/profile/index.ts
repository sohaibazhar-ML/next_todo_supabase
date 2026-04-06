import { z } from 'zod';
import { 
  createProfileSchema, 
  editProfileSchema, 
  passwordChangeSchema 
} from '@/schemas/website/profile.schema';

/**
 * TypeScript types inferred from schemas
 */
export type CreateProfileFormData = z.infer<typeof createProfileSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

/**
 * Union type for profile form data
 */
export type ProfileFormData = CreateProfileFormData | EditProfileFormData;

/**
 * Re-exporting schemas for convenience (maintaining compatibility with existing imports)
 */
export { 
  createProfileSchema, 
  editProfileSchema, 
  passwordChangeSchema 
} from '@/schemas/website/profile.schema';

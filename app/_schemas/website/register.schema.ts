import { z } from 'zod';
import { passwordSchema } from './password.schema';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  gender: z.string().min(1, 'Please select your gender'),
  firstName: z.string().min(1, 'First name is required').min(2, 'First name is too short'),
  lastName: z.string().min(1, 'Last name is required').min(2, 'Last name is too short'),
  currentAddress: z.string().min(1, 'Current address is required').min(5, 'Please enter a complete address'),
  country: z.string().min(1, 'Please select your country'),
  newAddress: z.string().min(1, 'New address is required').min(5, 'Please enter a complete address'),
  numPersons: z.string().min(1, 'Number of persons is required').refine(val => parseInt(val) >= 0, { message: 'Must be 0 or more' }),
  numAdults: z.string().min(1, 'Number of adults is required').refine(val => parseInt(val) >= 0, { message: 'Must be 0 or more' }),
  numChildren: z.string().optional().refine(val => !val || parseInt(val) >= 0, { message: 'Must be 0 or more' }),
  pets: z.string().min(1, 'Please select if you have pets'),
  whichPets: z.string().optional(),
  phone: z.string().optional(),
  preferredTime: z.string().optional(),
  consent: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

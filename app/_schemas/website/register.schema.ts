import { z } from 'zod';
import { passwordSchema } from './password.schema';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(50, 'Email is too long'),
  password: passwordSchema,
  gender: z.string().min(1, 'Please select your gender'),
  firstName: z.string().min(1, 'First name is required').min(2, 'First name is too short').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').min(2, 'Last name is too short').max(50, 'Last name is too long'),
  currentAddress: z.string().min(1, 'Current address is required').min(5, 'Please enter a complete address').max(200, 'Address is too long'),
  country: z.string().min(1, 'Please select your country'),
  newAddress: z.string().min(1, 'New address is required').min(5, 'Please enter a complete address').max(200, 'Address is too long'),
  numPersons: z.string().min(1, 'Number of persons is required').max(3, 'Invalid number').refine((val: string) => parseInt(val) >= 0, { message: 'Must be 0 or more' }),
  numAdults: z.string().min(1, 'Number of adults is required').max(3, 'Invalid number').refine((val: string) => parseInt(val) >= 0, { message: 'Must be 0 or more' }),
  numChildren: z.string().max(3, 'Invalid number').optional().refine((val?: string) => !val || parseInt(val) >= 0, { message: 'Must be 0 or more' }),
  pets: z.string().min(1, 'Please select if you have pets'),
  whichPets: z.string().max(300, 'Description is too long').optional(),
  phone: z.string().max(20, 'Phone number is too long').regex(/^[0-9+\-]*$/, 'Only numbers, + and - are allowed').optional(),
  preferredTime: z.string().optional(),
  consent: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

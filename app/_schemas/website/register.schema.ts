import { z } from 'zod';
import { passwordSchema } from './password.schema';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  gender: z.string().min(1, 'Please select your gender'),
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  currentAddress: z.string().min(5, 'Please enter your current address'),
  country: z.string().min(1, 'Please select your country'),
  newAddress: z.string().min(5, 'Please enter your new address in Switzerland'),
  numPersons: z.string().min(1, 'Please enter number of persons').refine(val => parseInt(val) >= 0, { message: 'Must be 0 or more' }),
  numAdults: z.string().min(1, 'Please enter number of adults').refine(val => parseInt(val) >= 0, { message: 'Must be 0 or more' }),
  numChildren: z.string().optional().refine(val => !val || parseInt(val) >= 0, { message: 'Must be 0 or more' }),
  pets: z.string().min(1, 'Please select if you have pets'),
  whichPets: z.string().optional(),
  phone: z.string().optional(),
  preferredTime: z.string().optional(),
  consent: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

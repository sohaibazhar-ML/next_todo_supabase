import { z } from 'zod';

/**
 * Schema for the footer contact/callback form
 */
export const contactSchema = z.object({
  footer_name: z.string().min(1, 'Name is required').min(2, 'Name is too short').max(100, 'Name is too long'),
  footer_phone: z.string().min(1, 'Phone number is required').regex(/^[0-9+\-\s]*$/, 'Invalid phone number format').max(20, 'Phone number is too long'),
  footer_time: z.string().min(1, 'Please select a preferred time'),
});

export type ContactInput = z.infer<typeof contactSchema>;

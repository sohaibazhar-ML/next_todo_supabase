import { z } from 'zod';
import { passwordSchema } from './password.schema';

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

"use server";

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { passwordChangeSchema } from '@/app/_schemas/website/profile.schema';

/**
 * Updates the preferred language in a cookie
 */
export async function updateLanguageAction(locale: string) {
  try {
    const cookieStore = await cookies();
    const cookieOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 365, // 1 year
    };
    // NEXT_LOCALE drives the i18n routing
    cookieStore.set('NEXT_LOCALE', locale, cookieOptions);
    // user_locale is read by middleware to keep NEXT_LOCALE in sync on every request
    cookieStore.set('user_locale', locale, cookieOptions);

    return { success: true };
  } catch (error) {
    console.error('Update language error:', error);
    return { success: false, error: 'Failed to update language preference' };
  }
}

/**
 * Toggles the "Keep me logged in" setting
 */
export async function updateKeepLoggedInAction(value: boolean) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Update database
    await prisma.profiles.update({
      where: { id: user.id },
      data: { keep_me_logged_in: value }
    });

    // Update cookie
    const cookieStore = await cookies();
    cookieStore.set('keep_me_logged_in', value.toString(), {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidatePath('/account/settings', 'page');
    return { success: true };
  } catch (error) {
    console.error('Update session error:', error);
    return { success: false, error: 'Failed to update session preference' };
  }
}

/**
 * Securely changes the user's password
 * Requires old password for re-authentication
 */
export async function changePasswordAction(oldPassword: string, newPassword: string, confirmPassword: string) {
  try {
    // 0. Validate input using Zod
    const validatedFields = passwordChangeSchema.safeParse({
      oldPassword,
      newPassword,
      confirmPassword,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) throw new Error('Unauthorized');

    // 1. Verify old password by attempting a sign-in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      throw new Error('Incorrect old password');
    }

    // 2. Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

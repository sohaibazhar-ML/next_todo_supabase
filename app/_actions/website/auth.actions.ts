"use server";

import { loginSchema } from '@/app/_schemas/website/login.schema';
import { forgotPasswordSchema } from '@/app/_schemas/website/forgot-password.schema';
import { resetPasswordSchema } from '@/app/_schemas/website/reset-password.schema';
import { registerSchema } from '@/app/_schemas/website/register.schema';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ActionState } from '@/app/_types/website/actions/auth.types';

export async function forgotPasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string;

  // Validate using Zod
  const validatedFields = forgotPasswordSchema.safeParse({
    email,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=recovery`,
    });

    if (error) {
      return { errors: { form: error.message } };
    }

    return { success: true };
  } catch (err) {
    console.error('Forgot password error:', err);
    return { errors: { form: 'An unexpected error occurred. Please try again.' } };
  }
}

export async function registerAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData.entries());

  // Convert checkbox value to boolean
  const formattedData = {
    ...data,
    consent: data.consent === 'on',
  };

  // Validate using Zod
  const validatedFields = registerSchema.safeParse(formattedData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, firstName, lastName, gender, currentAddress, country, newAddress, numPersons, numAdults, numChildren, pets, whichPets, phone, preferredTime } = validatedFields.data;

  try {
    const supabase = await createClient();

    // 1. Sign up user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (authError) {
      return { errors: { form: authError.message } };
    }

    if (!authData.user) {
      return { errors: { form: 'Registration failed. Please try again.' } };
    }

    // 2. Create profile in Prisma
    // Username is optional and not present in the current UI design

    await prisma.profiles.create({
      data: {
        id: authData.user.id,
        username: null,
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone || null,
        current_address: currentAddress,
        country_of_origin: country,
        new_address_switzerland: newAddress,
        number_of_adults: parseInt(numAdults),
        number_of_children: numChildren ? parseInt(numChildren) : 0,
        total_persons: parseInt(numPersons),
        gender,
        preferred_call_time: preferredTime || null,
        has_pets: pets === 'yes',
        pets_type: pets === 'yes' ? whichPets || null : null,
        marketing_consent: formattedData.consent || false,
        terms_accepted: true,
        data_privacy_accepted: true,
        role: 'user',
        preferred_language: (data.locale as string) || 'de',
      }
    });

    return { success: true };
  } catch (err) {
    console.error('Registration error:', err);
    // Handle unique constraint violation for username/email
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return { errors: { form: 'Username or email already exists.' } };
    }
    return { errors: { form: 'An unexpected error occurred. Please try again.' } };
  }
}

export async function resetPasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validate using Zod
  const validatedFields = resetPasswordSchema.safeParse({
    newPassword,
    confirmPassword,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { errors: { form: error.message } };
    }

    return { success: true };
  } catch (err) {
    console.error('Reset password error:', err);
    return { errors: { form: 'An unexpected error occurred. Please try again.' } };
  }
}

export async function loginAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const keepMeLoggedIn = formData.get('keepMeLoggedIn') === 'on';

  // Validate using Zod
  const validatedFields = loginSchema.safeParse({
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !user) {
      return { errors: { form: error?.message || 'Invalid email or password.' } };
    }

    // 2. Fetch user profile to get preferred language
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { preferred_language: true }
    });

    // 3. Set persistence preference and locale cookies for the middleware
    const cookieStore = await cookies();
    const cookieOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    cookieStore.set('keep_me_logged_in', keepMeLoggedIn.toString(), {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    if (profile?.preferred_language) {
      const localeOptions = {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 365, // 1 year
      };
      cookieStore.set('NEXT_LOCALE', profile.preferred_language, localeOptions);
      cookieStore.set('user_locale', profile.preferred_language, localeOptions);
    }

    // Success - redirect to dashboard
  } catch (err) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('Login error:', err);
    return { errors: { form: 'Invalid email or password.' } };
  }

  // Get preferred locale for redirect
  const cookieStore = await cookies();
  const locale = cookieStore.get('user_locale')?.value || cookieStore.get('NEXT_LOCALE')?.value || 'de';

  redirect(`/${locale}/dashboard`);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Clear the persistence cookie
  const cookieStore = await cookies();
  cookieStore.delete('keep_me_logged_in');

  // Get current locale for redirect
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'de';

  redirect(`/${locale}`);
}

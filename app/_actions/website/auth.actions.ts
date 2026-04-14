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
import { createServiceClient } from '@/lib/supabase/service';
import { sendGridService } from '@/app/_services/website/email-service/sendgrid.service';
import { getTranslations } from 'next-intl/server';

/**
 * Checks if an error is related to a network connection failure or timeout.
 */
function isConnectionError(err: any): boolean {
  if (!err) return false;
  
  // Check for common connection error signatures
  const isTimeout = err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.cause?.code === 'UND_ERR_CONNECT_TIMEOUT';
  const isFetchFailed = err.message?.toLowerCase().includes('fetch failed');
  const isNetworkError = err.message?.toLowerCase().includes('network error') || err.message?.toLowerCase().includes('eai_again');

  return isTimeout || isFetchFailed || isNetworkError;
}

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

  const t = await getTranslations('Login');

  try {
    // 1. Check if user exists in the profiles table
    const profile = await prisma.profiles.findUnique({
      where: { email },
      select: { id: true, first_name: true }
    });

    if (!profile) {
      return { errors: { form: t('errors.userNotFound') } };
    }

    // 2. Generate a recovery link using the admin API
    const admin = createServiceClient();
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=recovery`,
      },
    });

    if (linkError || !linkData.properties?.action_link) {
      if (isConnectionError(linkError)) {
        return { errors: { form: t('errors.connectionError') } };
      }
      return { errors: { form: linkError?.message || 'Failed to generate reset link' } };
    }

    // 3. Send the email via SendGrid
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'de';

    const emailResult = await sendGridService.sendTemplateEmail({
      to: email,
      templateKey: 'PASSWORD_RESET',
      dynamicTemplateData: {
        user: profile.first_name || 'User',
        link: `${baseUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=recovery`,
        homepagelink: `${baseUrl}/${locale}`,
        dataprotectionlink: `${baseUrl}/${locale}/privacy`,
        impressumlink: `${baseUrl}/${locale}/imprint`,
      },
    });

    if (!emailResult.success) {
      return { errors: { form: emailResult.error || 'Failed to send reset email' } };
    }

    return { success: true };
  } catch (err) {
    console.error('Forgot password error:', err);
    if (isConnectionError(err)) {
      return { errors: { form: t('errors.connectionError') } };
    }
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
    const admin = createServiceClient();

    // 1. Sign up user in Supabase via Admin API to bypass the automatic email
    // This creates an unconfirmed user WITHOUT dispatching the default Supabase template
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, 
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      }
    });

    if (authError) {
      if (isConnectionError(authError)) {
        const loginT = await getTranslations('Login');
        return { errors: { form: loginT('errors.connectionError') } };
      }
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

    // 3. Generate confirmation link and send via SendGrid
    // Use 'magiclink' type since the user already exists (created via admin.createUser above).
    // 'signup' type fails silently for existing users. 'magiclink' works and also
    // confirms the user's email when they click the link.
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (linkError || !linkData.properties?.action_link) {
      console.error('Failed to generate confirmation link:', linkError);
      if (isConnectionError(linkError)) {
        const loginT = await getTranslations('Login');
        return { errors: { form: loginT('errors.connectionError') } };
      }
    } else {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const locale = (data.locale as string) || 'de';
      const confirmLink = `${baseUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink`;

      const emailResult = await sendGridService.sendTemplateEmail({
        to: email,
        templateKey: 'AUTH_CONFIRMATION',
        dynamicTemplateData: {
          user: firstName,
          link: confirmLink,
          homepagelink: `${baseUrl}/${locale}`,
          dataprotectionlink: `${baseUrl}/${locale}/privacy`,
          impressumlink: `${baseUrl}/${locale}/imprint`,
        },
      });

      if (!emailResult.success) {
        console.error('SendGrid failed to send confirmation email:', emailResult.error);
      }
    }

    return { success: true, email };
  } catch (err) {
    console.error('Registration error:', err);
    
    // Check for connection error first
    const t = await getTranslations('Login');
    if (isConnectionError(err)) {
      return { errors: { form: t('errors.connectionError') } };
    }

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
      if (isConnectionError(error)) {
        const t = await getTranslations('Login');
        return { errors: { form: t('errors.connectionError') } };
      }
      return { errors: { form: error.message } };
    }

    return { success: true };
  } catch (err) {
    console.error('Reset password error:', err);
    if (isConnectionError(err)) {
      const t = await getTranslations('Login');
      return { errors: { form: t('errors.connectionError') } };
    }
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

  const t = await getTranslations('Login');

  try {
    // 1. Check if user exists in the profiles table to provide a specific error
    const profile = await prisma.profiles.findUnique({
      where: { email },
      select: { id: true, preferred_language: true, email_confirmed: true }
    });

    if (!profile) {
      return { errors: { form: t('errors.userNotFound') } };
    }

    // 2. Block login if email is not confirmed
    if (!profile.email_confirmed) {
      return { 
        errors: { form: t('errors.emailNotConfirmed') },
        needsConfirmation: true,
        email: email
      };
    }

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !user) {
      if (isConnectionError(error)) {
        return { errors: { form: t('errors.connectionError') } };
      }
      return { errors: { form: t('errors.invalidCredentials') } };
    }

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
    
    if (isConnectionError(err)) {
      return { errors: { form: t('errors.connectionError') } };
    }
    
    return { errors: { form: t('errors.invalidCredentials') } };
  }

  // Get preferred locale for redirect
  const cookieStore = await cookies();
  const locale = cookieStore.get('user_locale')?.value || cookieStore.get('NEXT_LOCALE')?.value || 'de';

  redirect(`/${locale}/dashboard`);
}

export async function resendConfirmationAction(email: string): Promise<ActionState> {
  const t = await getTranslations('Register');
  const loginT = await getTranslations('Login');

  try {
    // 1. Check if user exists and is not confirmed
    const profile = await prisma.profiles.findUnique({
      where: { email },
      select: { id: true, email_confirmed: true, first_name: true, preferred_language: true }
    });

    if (!profile) {
      return { errors: { form: t('resendError') } };
    }

    if (profile.email_confirmed) {
      return { success: true }; // Already confirmed
    }

    // 2. Generate a new confirmation link (using magiclink as it doesn't require password)
    const admin = createServiceClient();
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (linkError || !linkData.properties?.action_link) {
      console.error('Failed to generate resend link:', linkError);
      if (isConnectionError(linkError)) {
        return { errors: { form: loginT('errors.connectionError') } };
      }
      return { errors: { form: t('resendError') } };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const locale = profile.preferred_language || 'de';

    // 3. Send email via SendGrid
    await sendGridService.sendTemplateEmail({
      to: email,
      templateKey: 'AUTH_CONFIRMATION',
      dynamicTemplateData: {
        user: profile.first_name,
        link: `${baseUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink`,
        homepagelink: `${baseUrl}/${locale}`,
        dataprotectionlink: `${baseUrl}/${locale}/privacy`,
        impressumlink: `${baseUrl}/${locale}/imprint`,
      },
    });

    return { success: true };
  } catch (err) {
    console.error('Resend confirmation error:', err);
    if (isConnectionError(err)) {
      return { errors: { form: loginT('errors.connectionError') } };
    }
    return { errors: { form: t('resendError') } };
  }
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

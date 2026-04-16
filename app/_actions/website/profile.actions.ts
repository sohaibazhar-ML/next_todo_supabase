"use server";

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateProfileName(fullName: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Split the name at the first space
    const parts = fullName.trim().split(/\s+/);
    const first_name = parts[0] || '';
    const last_name = parts.slice(1).join(' ') || '';

    if (!first_name) {
      throw new Error('First name is required');
    }

    await prisma.profiles.update({
      where: { id: user.id },
      data: {
        first_name,
        last_name,
      }
    });

    // Revoke the cache for the account page to reflect the new name
    revalidatePath('/account', 'page');
    revalidatePath('/dashboard', 'page');

    return { success: true };
  } catch (error) {
    console.error('Update profile name error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

export async function updateProfileField(field: string, value: unknown) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    // List of allowed fields for safety
    const allowedFields = [
      'phone_number',
      'current_address',
      'country_of_origin',
      'new_address_switzerland',
      'preferred_language'
    ];

    if (!allowedFields.includes(field)) {
      throw new Error('Invalid field update');
    }

    await prisma.profiles.update({
      where: { id: user.id },
      data: {
        [field]: value,
      }
    });

    revalidatePath('/account', 'page');
    revalidatePath('/dashboard', 'page');
    revalidatePath('/account/settings', 'page');

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error(`Update profile ${field} error:`, message);
    return { 
      success: false, 
      error: message
    };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    // Use service client to manage storage (bypasses RLS for bucket creation/upload)
    const { createServiceClient } = await import('@/lib/supabase/service');
    const serviceClient = createServiceClient();

    // 1. Fetch current profile to check for existing avatar
    const currentProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { avatar_url: true }
    });

    const oldAvatarUrl = currentProfile?.avatar_url;

    // 2. Ensure the 'avatars' bucket exists
    const { data: buckets } = await serviceClient.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'avatars');
    if (!bucketExists) {
      await serviceClient.storage.createBucket('avatars', { public: true });
    }

    // 3. Upload new file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await serviceClient.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);

    // 4. Get Public URL for the new avatar
    const { data: { publicUrl } } = serviceClient.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // 5. Update Database with the new URL
    await prisma.profiles.update({
      where: { id: user.id },
      data: { avatar_url: publicUrl }
    });

    // 6. Cleanup: Delete the old avatar from storage if it exists
    if (oldAvatarUrl) {
      try {
        // Extract the path from the URL. Example: avatars/userId/ts.ext
        // Most flexible way is splitting and taking the last part matching our bucket structure
        const pathMatch = oldAvatarUrl.split('/public/avatars/').pop();
        if (pathMatch) {
          await serviceClient.storage
            .from('avatars')
            .remove([pathMatch]);
          console.log(`Successfully deleted old avatar: ${pathMatch}`);
        }
      } catch (cleanupError) {
        // Don't fail the whole action if cleanup fails, just log it
        console.error('Failed to cleanup old avatar:', cleanupError);
      }
    }

    revalidatePath('/account', 'page');
    revalidatePath('/dashboard', 'page');
    revalidatePath('/account/settings', 'page');

    return { success: true, avatarUrl: publicUrl };
  } catch (error) {
    console.error('Upload avatar error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

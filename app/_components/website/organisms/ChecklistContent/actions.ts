"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateChecklistProgress(
  userId: string,
  itemId: string,
  data: { is_completed?: boolean; deadline?: Date }
) {
  try {
    const existing = await prisma.userChecklistProgress.findUnique({
      where: {
        idx_user_checklist_unique: {
          user_id: userId,
          checklist_item_id: itemId
        }
      }
    });

    if (existing) {
      await prisma.userChecklistProgress.update({
        where: { id: existing.id },
        data: {
          ...data,
          updated_at: new Date()
        }
      });
    } else {
      await prisma.userChecklistProgress.create({
        data: {
          user_id: userId,
          checklist_item_id: itemId,
          is_completed: data.is_completed || false,
          deadline: data.deadline || null,
          updated_at: new Date()
        }
      });
    }

    revalidatePath('/dashboard/checklist');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating checklist progress:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}

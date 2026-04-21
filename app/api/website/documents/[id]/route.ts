import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { STORAGE_BUCKETS } from '@/constants';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if document exists and belongs to user
    const document = await prisma.documents.findUnique({
      where: { id }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this document' }, { status: 403 });
    }

    // 1. Delete from Supabase storage
    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .remove([document.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // We continue even if storage deletion fails, to ensure database consistency
        // but we log the error.
      }
    }

    // 2. Delete from database
    await prisma.documents.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

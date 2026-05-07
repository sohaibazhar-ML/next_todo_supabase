import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/utils/roles';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIsAdmin = await isAdmin(user.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'The uploaded file is empty.' }, { status: 400 });
    }

    // Check if at least one row has the required columns
    const hasValidData = data.some(row => 
      (row['Kategorie'] || row['category'] || row['Category']) && 
      (row['Dokumentname'] || row['dokumentname'] || row['Document Name'] || row['Title'])
    );

    if (!hasValidData) {
      return NextResponse.json({ 
        error: 'Invalid file format. Please ensure your file has "Kategorie" and "Dokumentname" columns.' 
      }, { status: 400 });
    }

    // Mapping for swiss_umzugsdokumente_uebersicht.xlsx:
    // Kategorie, Dokumentname, Zuständige Stelle / Empfänger, Datei
    
    let importedCount = 0;
    let skippedCount = 0;
    const newCategories = new Set<string>();

    for (const row of data) {
      const category = row['Kategorie'] || row['category'] || row['Category'];
      const title = row['Dokumentname'] || row['dokumentname'] || row['Document Name'] || row['Title'];
      const recipient = row['Zuständige Stelle / Empfänger'] || row['recipient'] || row['Recipient'];
      const file_type_raw = row['Datei'] || row['datei'] || row['File Type'] || 'document';
      
      const file_type = file_type_raw.toString().toLowerCase().includes('pdf') ? 'pdf' : 'document';

      if (category && title) {
        // Duplication Check: Check if document already exists with same title, category, and recipient
        const existing = await prisma.documents.findFirst({
          where: {
            title,
            category,
            recipient: recipient || undefined,
          }
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        await prisma.documents.create({
          data: {
            title,
            category,
            recipient,
            file_type,
            created_by: user.id,
            // Since there is no actual file yet, file_path and file_name remain null
            is_featured: false,
          }
        });
        newCategories.add(category);
        importedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${importedCount} document placeholders. ${skippedCount} duplicates were skipped.`,
      categories: Array.from(newCategories),
      importedCount,
      skippedCount
    });

  } catch (error: any) {
    console.error('Document placeholder import error:', error);
    return NextResponse.json({ error: 'Failed to import documents: ' + error.message }, { status: 500 });
  }
}

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
      (row['ToDo'] || row['todo'] || row['Task'] || row['Title'])
    );

    if (!hasValidData) {
      return NextResponse.json({ 
        error: 'Invalid file format. Please ensure your file has "Kategorie" and "ToDo" columns.' 
      }, { status: 400 });
    }

    // Mapping for expat_master_checklist_pro.xlsx:
    // Phase, Kategorie, ToDo, Beschreibung, Pflicht
    
    let importedCount = 0;
    let skippedCount = 0;
    const newCategories = new Set<string>();

    for (const row of data) {
      const phase = row['Phase'] || row['phase'] || null;
      const category = row['Kategorie'] || row['category'] || row['Category'];
      const title = row['ToDo'] || row['todo'] || row['Task'] || row['Title'];
      const description = row['Beschreibung'] || row['description'] || row['Description'] || null;
      const mandatoryValue = row['Pflicht'] || row['pflicht'] || row['Mandatory'] || 'ja';
      const is_mandatory = mandatoryValue.toString().toLowerCase() === 'ja' || mandatoryValue.toString().toLowerCase() === 'yes' || mandatoryValue === true;

      if (category && title) {
        // Duplication Check: Check if this exact row already exists
        const existing = await (prisma as any).checklistItem.findFirst({
          where: {
            title,
            category,
            phase: phase || undefined, // Handle null vs undefined for Prisma
          }
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        await (prisma as any).checklistItem.create({
          data: {
            phase,
            category,
            title,
            description,
            is_mandatory
          }
        });
        newCategories.add(category);
        importedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${importedCount} checklist items. ${skippedCount} duplicates were skipped.`,
      categories: Array.from(newCategories),
      importedCount,
      skippedCount
    });

  } catch (error: any) {
    console.error('Checklist import error:', error);
    return NextResponse.json({ error: 'Failed to import checklist: ' + error.message }, { status: 500 });
  }
}

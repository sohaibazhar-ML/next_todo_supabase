import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, isSubadmin } from '@/utils/roles';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleProfile = await prisma.profiles.findUnique({
        where: { id: user.id },
        select: { role: true }
    });

    const role = roleProfile?.role || 'user';
    if (role !== 'admin' && role !== 'subadmin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const items = await prisma.checklistItem.findMany({
            select: { category: true, phase: true }
        });

        const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
        const phases = Array.from(new Set(items.map(i => i.phase).filter(Boolean)));

        return NextResponse.json({
            categories: categories.sort(),
            phases: phases.sort()
        });
    } catch (error) {
        console.error('[Checklist Filters API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

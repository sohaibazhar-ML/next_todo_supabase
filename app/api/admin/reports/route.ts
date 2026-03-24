import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, isSubadmin } from '@/lib/utils/roles';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIsAdmin = await isAdmin(user.id);
    const userIsSubadmin = await isSubadmin(user.id);

    if (!userIsAdmin && !userIsSubadmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    try {
        let start: Date;
        let end: Date;

        if (fromParam && toParam) {
            start = new Date(fromParam);
            end = new Date(toParam);
            // Ensure 'end' includes the entire day
            end.setHours(23, 59, 59, 999);
        } else {
            // Default to current month if no dates provided
            start = startOfMonth(new Date());
            end = endOfMonth(new Date());
        }

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        // Get all uploads in this interval
        const uploads = await prisma.documents.findMany({
            where: {
                created_at: {
                    gte: start,
                    lte: end,
                },
            },
            select: {
                created_at: true,
            },
        });

        // Get all downloads in this interval
        const downloads = await prisma.download_logs.findMany({
            where: {
                downloaded_at: {
                    gte: start,
                    lte: end,
                },
            },
            select: {
                downloaded_at: true,
            },
        });

        // Aggregate by day
        const days = eachDayOfInterval({ start, end });
        const reportData = days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dailyUploads = uploads.filter(u => u.created_at && format(u.created_at, 'yyyy-MM-dd') === dayStr).length;
            const dailyDownloads = downloads.filter(d => d.downloaded_at && format(d.downloaded_at, 'yyyy-MM-dd') === dayStr).length;

            return {
                date: dayStr,
                uploads: dailyUploads,
                downloads: dailyDownloads,
            };
        });

        return NextResponse.json({
            from: format(start, 'yyyy-MM-dd'),
            to: format(end, 'yyyy-MM-dd'),
            totalUploads: uploads.length,
            totalDownloads: downloads.length,
            dailyData: reportData,
        });
    } catch (error) {
        console.error('[Reports API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserPermissions } from '@/utils/roles';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAdmin, isSubadmin } = await getUserPermissions(user.id);

    if (!isAdmin && !isSubadmin) {
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
            end.setHours(23, 59, 59, 999);
        } else {
            start = startOfMonth(new Date());
            end = endOfMonth(new Date());
        }

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        // Get total counts for the period (Efficiently via DB)
        const [totalUploads, totalDownloads] = await Promise.all([
            prisma.documents.count({
                where: { created_at: { gte: start, lte: end } }
            }),
            prisma.download_logs.count({
                where: { downloaded_at: { gte: start, lte: end } }
            })
        ]);

        // Aggregate by day via Prisma's groupBy (optimizing for larger datasets)
        const uploadsByDay = await (prisma.documents as any).groupBy({
            by: ['created_at'],
            where: { created_at: { gte: start, lte: end } },
            _count: true,
        });

        const downloadsByDay = await (prisma.download_logs as any).groupBy({
            by: ['downloaded_at'],
            where: { downloaded_at: { gte: start, lte: end } },
            _count: true,
        });

        // Helper: Format date for daily matching
        const toDayKey = (date: Date | null) => date ? format(date, 'yyyy-MM-dd') : '';

        // Aggregate results into maps
        const uploadMap = new Map<string, number>();
        uploadsByDay.forEach((group: any) => {
            const key = toDayKey(group.created_at);
            uploadMap.set(key, (uploadMap.get(key) || 0) + (group._count || 0));
        });

        const downloadMap = new Map<string, number>();
        downloadsByDay.forEach((group: any) => {
            const key = toDayKey(group.downloaded_at);
            downloadMap.set(key, (downloadMap.get(key) || 0) + (group._count || 0));
        });

        // Map interval to aggregated data
        const days = eachDayOfInterval({ start, end });
        const reportData = days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            return {
                date: dayStr,
                uploads: uploadMap.get(dayStr) || 0,
                downloads: downloadMap.get(dayStr) || 0,
            };
        });

        return NextResponse.json({
            data: reportData,
            total: reportData.length,
            from: format(start, 'yyyy-MM-dd'),
            to: format(end, 'yyyy-MM-dd'),
            totalUploads,
            totalDownloads,
            dailyData: reportData,
        });
    } catch (error) {
        console.error('[Reports API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

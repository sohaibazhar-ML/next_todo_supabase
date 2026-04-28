/**
 * Admin CRUD API Route — /api/admin/[resource]
 * 
 * Handles all React Admin data operations using Prisma.
 * Every request is authorized (must be admin or subadmin).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isAdmin, isSubadmin } from '@/utils/roles';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { COUNTRIES } from '@/app/_components/admin/constants/countries';
import { STORAGE_BUCKETS } from '@/constants';

export const dynamic = 'force-dynamic';

// Whitelist of resources that can be accessed via this API
const ALLOWED_RESOURCES = ['profiles', 'users', 'documents', 'download_logs', 'documents-list', 'stats', 'settings', 'checklistItem', 'user_checklist_progress'] as const;
type ResourceName = typeof ALLOWED_RESOURCES[number];

function isAllowedResource(resource: string): resource is ResourceName {
    return ALLOWED_RESOURCES.includes(resource as ResourceName);
}

// Maps resource name → Prisma model delegate
type PrismaDelegate = Prisma.profilesDelegate<any> | Prisma.documentsDelegate<any> | Prisma.download_logsDelegate<any> | Prisma.ChecklistItemDelegate<any> | Prisma.UserChecklistProgressDelegate<any>;

function getPrismaModel(resource: ResourceName): PrismaDelegate {
    const models: Record<ResourceName, PrismaDelegate> = {
        profiles: prisma.profiles,
        users: prisma.profiles, // Alias for profiles
        documents: prisma.documents,
        'documents-list': prisma.documents,
        download_logs: prisma.download_logs,
        stats: prisma.profiles, // Dummy mapping for custom view
        settings: prisma.profiles, // Dummy mapping for custom view
        checklistItem: prisma.checklistItem,
        user_checklist_progress: prisma.userChecklistProgress,
    };
    return models[resource];
}

const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Helper: fetch user role from DB with one automatic retry (handles cold-start)
async function fetchUserRole(userId: string) {
    try {
        return await prisma.profiles.findUnique({
            where: { id: userId },
            select: { role: true }
        });
    } catch (firstError: unknown) {
        const message = firstError instanceof Error ? firstError.message : 'Unknown error';
        console.warn('[Admin API] DB cold-start — retrying in 1s:', message);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await prisma.profiles.findUnique({
            where: { id: userId },
            select: { role: true }
        });
    }
}

// Shared auth check — verifies session + admin/subadmin role
async function authorize(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        if (authError) {
            const message = authError.message.toLowerCase();
            // Check for network connection failures or timeouts
            if (message.includes('fetch failed') || message.includes('timeout')) {
                console.error('[Admin API] Auth service unavailable (Network):', authError.message);
                return { authorized: false as const, status: 503, message: 'Authentication service temporarily unavailable' };
            }
            console.error('[Admin API] Auth error:', authError.message);
        } else {
            console.error('[Admin API] No user session found');
        }
        return { authorized: false as const, status: 401, message: 'Unauthorized' };
    }

    try {
        const profile = await fetchUserRole(user.id);

        const role = profile?.role || 'user';
        const userIsAdmin = role === 'admin';
        const userIsSubadmin = role === 'subadmin';

        if (!userIsAdmin && !userIsSubadmin) {
            return { authorized: false as const, status: 403, message: 'Forbidden' };
        }

        return { authorized: true as const, user, isAdmin: userIsAdmin, role };
    } catch (dbError: unknown) {
        const message = dbError instanceof Error ? dbError.message : String(dbError);
        console.error('[Admin API] Database error during auth (after retry):', message);
        return { authorized: false as const, status: 503, message: 'Database temporarily unavailable' };
    }
}

// GET — handles getOne (?id=), getMany (?ids=), and getList (paginated)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> }
) {
    const auth = await authorize(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.message }, { status: auth.status });
    }

    const { resource } = await params;
    if (!isAllowedResource(resource)) {
        return NextResponse.json({ error: `Unknown resource: ${resource}` }, { status: 400 });
    }

    // Special Case: Statistics Dashboard
    if (resource === 'stats') {
        try {
            const searchParams = request.nextUrl.searchParams;
            const startDateStr = searchParams.get('startDate');
            const endDateStr = searchParams.get('endDate');

            // Set up current period (Default: last 30 days)
            let endDate = new Date();
            if (endDateStr) {
                endDate = new Date(endDateStr);
                endDate.setUTCHours(23, 59, 59, 999); // Ensure it includes the entire end day
            }
            
            const startDate = startDateStr ? new Date(startDateStr) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            
            // Set up previous period for trending (same duration as current)
            const durationMs = endDate.getTime() - startDate.getTime();
            const prevEndDate = new Date(startDate.getTime());
            const prevStartDate = new Date(startDate.getTime() - durationMs);

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // 1. Core Counts
            const totalUsers = await prisma.profiles.count();
            const totalDocuments = await prisma.documents.count();
            const totalDownloads = await prisma.download_logs.count();
            const recentDownloads = await prisma.download_logs.count({
                where: { downloaded_at: { gte: startDate, lte: endDate } }
            });
            const downloadsToday = await prisma.download_logs.count({
                where: { downloaded_at: { gte: todayStart } }
            });

            // 2. Previous Period Counts (for percentage trending)
            const prevUsers = await prisma.profiles.count({
                where: { created_at: { lt: startDate } }
            });
            const prevDocuments = await prisma.documents.count({
                where: { created_at: { lt: startDate } }
            });
            const prevDownloads = await prisma.download_logs.count({
                where: { downloaded_at: { gte: prevStartDate, lt: prevEndDate } }
            });

            const calculatePercent = (current: number, previous: number) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return Math.round(((current - previous) / previous) * 100);
            };

            // 3. User Growth Timeline (Within selected window)
            const newUsers = await prisma.profiles.findMany({
                where: { created_at: { gte: startDate, lte: endDate } },
                select: { created_at: true },
                orderBy: { created_at: 'asc' }
            });

            // Bucketize timeline by day
            const timelineMap = new Map<string, number>();
            const dayInMs = 24 * 60 * 60 * 1000;
            const daysCount = Math.floor(durationMs / dayInMs);
            
            for (let i = 0; i <= daysCount; i++) {
                const date = new Date(startDate.getTime() + (i * dayInMs));
                timelineMap.set(date.toISOString().split('T')[0], 0);
            }
            
            newUsers.forEach(u => {
                const day = u.created_at.toISOString().split('T')[0];
                if (timelineMap.has(day)) {
                    timelineMap.set(day, timelineMap.get(day)! + 1);
                }
            });

            const userGrowthTimeline = Array.from(timelineMap.entries())
                .sort((a, b) => a[0].localeCompare(b[0])) // Ensure chronological order
                .reduce((acc, [date, count], index) => {
                    const prevTotal = index === 0 ? totalUsers - newUsers.length : acc[index - 1].users;
                    acc.push({
                        date,
                        count,
                        users: prevTotal + count
                    });
                    return acc;
                }, [] as any[]);

            // 4. Downloads by Category (Distribution)
            // Note: We'll actually group by document.file_type as requested
            const logsWithDocs = await prisma.download_logs.findMany({
                where: { downloaded_at: { gte: startDate, lte: endDate } },
                include: { documents: { select: { file_type: true } } }
            });

            const categoryMap = new Map<string, number>();
            logsWithDocs.forEach(log => {
                const type = log.documents?.file_type || 'Unknown';
                categoryMap.set(type, (categoryMap.get(type) || 0) + 1);
            });

            const downloadsByCategory = Array.from(categoryMap.entries())
                .map(([category, count]) => ({ category, count }))
                .sort((a, b) => b.count - a.count);

            // 5. Top Downloads (Top 5)
            const topLogs = await prisma.download_logs.groupBy({
                by: ['document_id'],
                where: { downloaded_at: { gte: startDate, lte: endDate } },
                _count: { _all: true },
                orderBy: { _count: { document_id: 'desc' } },
                take: 5
            });

            const topDocDetails = await prisma.documents.findMany({
                where: { id: { in: topLogs.map(l => l.document_id) } },
                select: { id: true, title: true, file_type: true }
            });

            const topDownloads = topLogs.map(log => {
                const doc = topDocDetails.find(d => d.id === log.document_id);
                return {
                    id: log.document_id,
                    title: doc?.title || 'Deleted Document',
                    file_type: doc?.file_type || 'unknown',
                    count: log._count._all
                };
            });

            return NextResponse.json({
                totalUsers,
                totalDocuments,
                totalDownloads,
                recentDownloads,
                downloadsToday,
                userGrowthPercent: calculatePercent(totalUsers, prevUsers),
                documentGrowthPercent: calculatePercent(totalDocuments, prevDocuments),
                downloadGrowthPercent: calculatePercent(totalDownloads, prevDownloads), // Lifetime total growth vs prev total - slightly odd but follows some patterns
                recentDownloadPercent: calculatePercent(recentDownloads, prevDownloads), // 30d vs previous 30d
                userGrowthTimeline,
                downloadsByCategory,
                topDownloads
            });
        } catch (error) {
            console.error('[Admin API] Global stats error:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    }

    const model = getPrismaModel(resource);
    const searchParams = request.nextUrl.searchParams;

    const id = searchParams.get('id');
    const ids = searchParams.get('ids');

    // Define includes for specific resources to fetch related data
    const includes: Record<string, Record<string, unknown>> = {
        download_logs: {
            documents: { select: { title: true } },
            profiles: { select: { username: true, email: true } }
        },
        user_checklist_progress: {
            checklist_items: { select: { title: true, category: true, is_mandatory: true } }
        }
    };
    const include = includes[resource];

    // Single record by ID
    if (id) {
        try {
            if (!isUuid(id)) {
                return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
            }
            const record = await (model as any).findUnique({ 
                where: { id },
                include
            });
            if (!record) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            return NextResponse.json(serializeRecord(record, resource));
        } catch (error) {
            console.error('[Admin API] getOne error:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    }

    // Multiple records by IDs
    if (ids) {
        try {
            const idList = JSON.parse(ids).filter(isUuid);
            if (idList.length === 0) return NextResponse.json([]);
            
            const records = await (model as any).findMany({ 
                where: { id: { in: idList } },
                include
            });
            return NextResponse.json(records.map((r: unknown) => serializeRecord(r, resource)));
        } catch (error) {
            console.error('[Admin API] getMany error:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    }

    // Paginated list with sorting and optional filters
    const page = parseInt(searchParams.get('_page') || '1');
    const perPage = parseInt(searchParams.get('_perPage') || '10');
    const sortField = searchParams.get('_sortField') || 'created_at';
    const sortOrder = (searchParams.get('_sortOrder') || 'DESC').toLowerCase();
    const filterParam = searchParams.get('_filters');

    // Build Prisma where clause from filters
    let where: Record<string, any> = {};

    // 1. Direct parameter fallbacks (highest priority/safest)
    const directId = searchParams.get('id');
    const directUserId = searchParams.get('user_id');
    const directDocId = searchParams.get('document_id');

    if (directId && isUuid(directId)) where.id = directId;
    if (directUserId && isUuid(directUserId)) where.user_id = directUserId;
    if (directDocId && isUuid(directDocId)) where.document_id = directDocId;

    if (filterParam) {
        try {
            // Support double-stringified JSON which can occur in some frontend environments
            let filters = typeof filterParam === 'string' && filterParam.startsWith('"{') 
                ? JSON.parse(JSON.parse(filterParam)) 
                : JSON.parse(filterParam);
            
            // Ensure filters is actually an object
            if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
                const { q, fromDate, toDate, lte_created_at, gte_created_at, ...exactFilters } = filters;

                // Global search (q)
                if (q) {
                    if (resource === 'documents' || resource === 'documents-list') {
                        where.OR = [
                            { title: { contains: q, mode: 'insensitive' } },
                            { description: { contains: q, mode: 'insensitive' } },
                            { file_name: { contains: q, mode: 'insensitive' } },
                            { category: { contains: q, mode: 'insensitive' } },
                            { file_type: { contains: q, mode: 'insensitive' } },
                            { mime_type: { contains: q, mode: 'insensitive' } },
                            { recipient: { contains: q, mode: 'insensitive' } },
                        ];
                    } else if (resource === 'profiles' || resource === 'users') {
                        // Resolve country names to 2-letter codes for DB matching (e.g. "Pakistan" -> "PK")
                        const matchingCountryCodes = COUNTRIES
                            .filter(c => c.label.toLowerCase().includes(q.toLowerCase()))
                            .map(c => c.value);

                        where.OR = [
                            { first_name: { contains: q, mode: 'insensitive' } },
                            { last_name: { contains: q, mode: 'insensitive' } },
                            { email: { contains: q, mode: 'insensitive' } },
                            { role: { contains: q, mode: 'insensitive' } },
                            { current_address: { contains: q, mode: 'insensitive' } },
                            { country_of_origin: { contains: q, mode: 'insensitive' } },
                            { phone_number: { contains: q, mode: 'insensitive' } },
                            { pets_type: { contains: q, mode: 'insensitive' } },
                            { new_address_switzerland: { contains: q, mode: 'insensitive' } },
                        ];

                        if (matchingCountryCodes.length > 0) {
                            where.OR.push({ country_of_origin: { in: matchingCountryCodes } });
                        }
                    } else if (resource === 'download_logs') {
                        where.OR = [
                            { user_agent: { contains: q, mode: 'insensitive' } },
                            { context: { contains: q, mode: 'insensitive' } },
                            { documents: { title: { contains: q, mode: 'insensitive' } } },
                            { profiles: { username: { contains: q, mode: 'insensitive' } } },
                            { profiles: { email: { contains: q, mode: 'insensitive' } } },
                            { profiles: { first_name: { contains: q, mode: 'insensitive' } } },
                            { profiles: { last_name: { contains: q, mode: 'insensitive' } } },
                        ];
                        if (/^[0-9.:]+$/.test(q)) {
                            where.OR.push({ ip_address: { equals: q } });
                        }
                    } else if (isUuid(q)) {
                        where.id = q;
                    }
                }

                // Date Range Filtering
                const start = filters.fromDate || filters.gte_created_at;
                const end = filters.toDate || filters.lte_created_at;
                if (start || end) {
                    where.created_at = {};
                    if (start) where.created_at.gte = new Date(start);
                    if (end) where.created_at.lte = new Date(end);
                }

                // Other exact or string matches
                for (const [key, value] of Object.entries(exactFilters)) {
                    if (key === 'role' && value === 'all') continue;
                    if (value === undefined || value === null || value === '') continue;

                    let filterKey = key;
                    if ((resource === 'documents' || resource === 'documents-list') && key === 'fileType') filterKey = 'file_type';

                    if (key === 'role' && (resource === 'profiles' || resource === 'users')) {
                        where[filterKey] = value;
                    } else if (typeof value === 'string' && value.length > 0) {
                        const cleanValue = value.trim();
                        // FORCE exact match for anything that looks like an ID
                        const isIdField = ['id', 'user_id', 'document_id', 'parent_document_id', 'original_document_id', 'profile_id'].includes(filterKey) || filterKey.endsWith('_id');
                        
                        if (isIdField && isUuid(cleanValue)) {
                            where[filterKey] = cleanValue;
                        } else if (!isIdField) {
                            where[filterKey] = { contains: cleanValue, mode: 'insensitive' };
                        }
                    } else {
                        where[filterKey] = value;
                    }
                }
            }
        } catch (e) {
            console.error('[Admin API] Critical: Filter parsing failed for', filterParam, e);
        }
    }

    // SECURITY: Filter out user-uploaded documents (Category: Personal) from Admin Panel
    if (resource === 'documents' || resource === 'documents-list') {
        console.log(`[Admin API] Applying security filter for ${resource}`);
        
        // Use AND to ensure we don't overwrite existing filters (like search)
        const personalFilter = { category: { notIn: ['Personal', 'personal'] } };
        
        if (where.AND) {
            where.AND = [...(Array.isArray(where.AND) ? where.AND : [where.AND]), personalFilter];
        } else if (Object.keys(where).length > 0) {
            // If there's already a where clause, wrap it in AND
            where = { AND: [where, personalFilter] };
        } else {
            // Otherwise, just set the category filter
            where.category = { notIn: ['Personal', 'personal'] };
        }
    }

    // DIAGNOSTIC LOG: This will show in your terminal exactly what Prisma is looking for
    console.log(`[Admin API] ${resource} - Final WHERE:`, JSON.stringify(where, null, 2));

    try {
        // Fetch records + total count in parallel for efficiency
        const [records, total] = await Promise.all([
            (model as any).findMany({
                where,
                include,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' },
            }),
            (model as any).count({ where }),
        ]);
        
        console.log(`[Admin API] ${resource} - Found ${records.length} records out of ${total} total`);

        return NextResponse.json({
            data: records.map((r: unknown) => serializeRecord(r, resource)),
            total,
        });
    } catch (error) {
        console.error('[Admin API] getList error catch:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// SECURITY: Whitelist of fields allowed for each resource to prevent mass assignment
const RESOURCE_FIELD_WHITELISTS: Record<ResourceName, string[]> = {
    profiles: ['first_name', 'last_name', 'role', 'current_address', 'country_of_origin', 'phone_number', 'number_of_adults', 'number_of_children', 'has_pets', 'pets_type', 'new_address_switzerland', 'marketing_consent', 'terms_accepted', 'data_privacy_accepted', 'keep_me_logged_in', 'admin_notes', 'gender', 'preferred_call_time', 'total_persons', 'preferred_language'],
    users: ['first_name', 'last_name', 'role', 'current_address', 'country_of_origin', 'phone_number', 'number_of_adults', 'number_of_children', 'has_pets', 'pets_type', 'new_address_switzerland', 'marketing_consent', 'terms_accepted', 'data_privacy_accepted', 'keep_me_logged_in', 'admin_notes', 'gender', 'preferred_call_time', 'total_persons', 'preferred_language'],
    documents: ['title', 'description', 'category', 'is_featured', 'file_name', 'file_path', 'file_size', 'file_type', 'mime_type', 'recipient'],
    'documents-list': ['title', 'description', 'category', 'is_featured', 'recipient'],
    download_logs: [], // Usually read-only via this API
    checklistItem: ['phase', 'category', 'title', 'description', 'is_mandatory'],
    user_checklist_progress: ['is_completed', 'deadline'],
    stats: [], // Read-only
    settings: [], // Custom
};

function whitelistFields(data: Record<string, unknown>, resource: ResourceName): Record<string, unknown> {
    const allowedFields = RESOURCE_FIELD_WHITELISTS[resource];
    if (!allowedFields || allowedFields.length === 0) return data;
    
    const cleanData: Record<string, unknown> = {};
    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            cleanData[field] = data[field];
        }
    }
    return cleanData;
}

// POST — create a new record
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> }
) {
    const auth = await authorize(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.message }, { status: auth.status });
    }

    // Role-based restriction: Only Admins can create
    if (!auth.isAdmin) {
        return NextResponse.json({ error: 'Admin access required for creation' }, { status: 403 });
    }

    const { resource } = await params;
    if (!isAllowedResource(resource)) {
        return NextResponse.json({ error: `Unknown resource: ${resource}` }, { status: 400 });
    }

    const model = getPrismaModel(resource);
    const body = await request.json();

    // SECURITY: Whitelist fields to prevent mass assignment
    const data = whitelistFields(body, resource);

    try {
        const createData: any = { ...data };
        
        // Only add created_by if the resource is documents (the only model currently supporting it)
        if (resource === 'documents' || resource === 'documents-list') {
            createData.created_by = auth.user.id;
        }

        const record = await (model as any).create({ 
            data: createData
        });
        return NextResponse.json(serializeRecord(record, resource), { status: 201 });
    } catch (error) {
        console.error('[Admin API] create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT — update an existing record (expects { id, ...fields } in body)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> }
) {
    const auth = await authorize(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.message }, { status: auth.status });
    }

    // Role-based restriction: Only Admins can edit
    if (!auth.isAdmin) {
        return NextResponse.json({ error: 'Admin access required for updates' }, { status: 403 });
    }

    const { resource } = await params;
    if (!isAllowedResource(resource)) {
        return NextResponse.json({ error: `Unknown resource: ${resource}` }, { status: 400 });
    }

    const model = getPrismaModel(resource);
    const body = await request.json();
    const { id, ...inputData } = body;

    // SECURITY: Whitelist fields to prevent mass assignment
    const data = whitelistFields(inputData, resource);

    try {
        const record = await (model as any).update({ where: { id }, data });
        return NextResponse.json(serializeRecord(record, resource));
    } catch (error) {
        console.error('[Admin API] update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE — delete a record by ID (?id=xxx)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> }
) {
    const auth = await authorize(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.message }, { status: auth.status });
    }

    // Role-based restriction: Only Admins can delete
    if (!auth.isAdmin) {
        return NextResponse.json({ error: 'Admin access required for deletion' }, { status: 403 });
    }

    const { resource } = await params;
    if (!isAllowedResource(resource)) {
        return NextResponse.json({ error: `Unknown resource: ${resource}` }, { status: 400 });
    }

    const model = getPrismaModel(resource);
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // SECURITY: Prevent admins from deleting themselves to avoid accidental lockout
    if ((resource === 'profiles' || resource === 'users') && id === auth.user.id) {
        return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    try {
        // If we are deleting a user or profile, also delete from Supabase Auth
        if (resource === 'profiles' || resource === 'users') {
            const adminClient = createServiceClient();
            const { error: deleteError } = await adminClient.auth.admin.deleteUser(id);
            
            if (deleteError) {
                console.error('[Admin API] Supabase Auth deletion failed:', deleteError.message);
                // We log the error but proceed with DB deletion to maintain internal consistency
                // as the record might already be partially gone or orphaned.
            } else {
                console.log(`[Admin API] Successfully deleted auth user ${id} from Supabase`);
            }
        }

        // If we are deleting a document, also delete the file from Supabase Storage
        if (resource === 'documents' || resource === 'documents-list') {
            const document = await (model as any).findUnique({
                where: { id },
                select: { file_path: true }
            });
            
            if (document?.file_path) {
                const supabase = await createClient();
                const { error: deleteError } = await supabase.storage
                    .from(STORAGE_BUCKETS.DOCUMENTS)
                    .remove([document.file_path]);

                if (deleteError) {
                    console.error('[Admin API] Failed to delete document from storage:', deleteError.message);
                } else {
                    console.log(`[Admin API] Successfully deleted file ${document.file_path} from Supabase Storage`);
                }
            }
        }

        await (model as any).delete({ where: { id } });
        return NextResponse.json({ id });
    } catch (error) {
        console.error('[Admin API] delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Converts BigInt → number and Date → ISO string for JSON serialization
// Optionally flattens relations for specific resources
function serializeRecord(record: unknown, resource?: string): Record<string, unknown> | unknown {
    if (!record || typeof record !== 'object') return record;
    
    const rec = record as Record<string, unknown>;
    const serialized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(rec)) {
        if (typeof value === 'bigint') {
            serialized[key] = Number(value);
        } else if (value instanceof Date) {
            serialized[key] = value.toISOString();
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Recursively serialize nested objects (handles BigInt/Date in relations)
            serialized[key] = serializeRecord(value);
        } else {
            serialized[key] = value;
        }
    }

    // Specialized flattening for download_logs: move document title and user info to top-level
    if (resource === 'download_logs') {
        const docs = rec.documents as Record<string, unknown> | undefined;
        const profs = rec.profiles as Record<string, unknown> | undefined;
        
        if (docs && typeof docs.title === 'string') {
            serialized.document_title = docs.title;
        }
        if (profs) {
            if (typeof profs.username === 'string') serialized.username = profs.username;
            if (typeof profs.email === 'string') serialized.email = profs.email;
        }
    }

    return serialized;
}

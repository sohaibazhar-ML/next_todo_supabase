/**
 * Admin CRUD API Route — /api/admin/[resource]
 * 
 * Handles all React Admin data operations using Prisma.
 * Every request is authorized (must be admin or subadmin).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, isSubadmin } from '@/lib/utils/roles';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Whitelist of resources that can be accessed via this API
const ALLOWED_RESOURCES = ['profiles', 'users', 'documents', 'download_logs', 'user_document_versions', 'documents-list', 'stats', 'settings'] as const;
type ResourceName = typeof ALLOWED_RESOURCES[number];

function isAllowedResource(resource: string): resource is ResourceName {
    return ALLOWED_RESOURCES.includes(resource as ResourceName);
}

// Maps resource name → Prisma model delegate
function getPrismaModel(resource: ResourceName) {
    const models: Record<ResourceName, any> = {
        profiles: prisma.profiles,
        users: prisma.profiles, // Alias for profiles
        documents: prisma.documents,
        'documents-list': prisma.documents,
        download_logs: prisma.download_logs,
        user_document_versions: prisma.user_document_versions,
        stats: prisma.profiles, // Dummy mapping for custom view
        settings: prisma.profiles, // Dummy mapping for custom view
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
    } catch (firstError: any) {
        console.warn('[Admin API] DB cold-start — retrying in 1s:', firstError?.message);
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
        console.error('[Admin API] Auth error:', authError?.message || 'No user session');
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
    } catch (dbError: any) {
        console.error('[Admin API] Database error during auth (after retry):', dbError?.message || dbError);
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

    const model = getPrismaModel(resource);
    const searchParams = request.nextUrl.searchParams;

    const id = searchParams.get('id');
    const ids = searchParams.get('ids');

    // Single record by ID
    if (id) {
        try {
            if (!isUuid(id)) {
                return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
            }
            const record = await model.findUnique({ where: { id } });
            if (!record) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            return NextResponse.json(serializeRecord(record));
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
            
            const records = await model.findMany({ where: { id: { in: idList } } });
            return NextResponse.json(records.map(serializeRecord));
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
    let where: any = {};
    if (filterParam) {
        try {
            const filters = JSON.parse(filterParam);
            const { q, fromDate, lte_created_at, gte_created_at, ...exactFilters } = filters;

            // Global search (q)
            if (q) {
                if (resource === 'documents' || resource === 'documents-list') {
                    where.OR = [
                        { title: { contains: q, mode: 'insensitive' } },
                        { description: { contains: q, mode: 'insensitive' } },
                        { file_name: { contains: q, mode: 'insensitive' } },
                        { category: { contains: q, mode: 'insensitive' } },
                        { file_type: { contains: q, mode: 'insensitive' } },
                    ];
                } else if (resource === 'profiles' || resource === 'users') {
                    where.OR = [
                        { first_name: { contains: q, mode: 'insensitive' } },
                        { last_name: { contains: q, mode: 'insensitive' } },
                        { email: { contains: q, mode: 'insensitive' } },
                        { username: { contains: q, mode: 'insensitive' } },
                        { role: { contains: q, mode: 'insensitive' } },
                    ];
                } else if (resource === 'download_logs') {
                    // Raw search for download logs across multiple fields
                    where.OR = [
                        { user_agent: { contains: q, mode: 'insensitive' } },
                        { context: { contains: q, mode: 'insensitive' } },
                        // Search in related documents
                        { documents: { title: { contains: q, mode: 'insensitive' } } },
                        // Search in related profiles
                        { profiles: { username: { contains: q, mode: 'insensitive' } } },
                        { profiles: { email: { contains: q, mode: 'insensitive' } } },
                        { profiles: { first_name: { contains: q, mode: 'insensitive' } } },
                        { profiles: { last_name: { contains: q, mode: 'insensitive' } } },
                    ];
                    
                    // Handle IP address - Prisma doesn't support 'contains' on Inet type
                    // but we can try exact match if q looks like an IP
                    if (/^[0-9.:]+$/.test(q)) {
                        where.OR.push({ ip_address: { equals: q } });
                    }
                } else {
                    // Fallback for other resources: only use 'equals' on 'id' if q is a UUID
                    // This prevents 500 errors when q is a name/string
                    if (isUuid(q)) {
                        where.id = q;
                    }
                }
            }

            // Date Range Filtering (standard RA uses gte/lte prefix, custom dashboard used fromDate/toDate)
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
                if (!value && value !== false && value !== 0) continue;

                let filterKey = key;
                // Resource-specific mapping
                if (resource === 'documents' || resource === 'documents-list') {
                    if (key === 'fileType') filterKey = 'file_type';
                }

                if (key === 'tags' && resource === 'documents') {
                    // Handle tags array filtering
                    const tagList = typeof value === 'string' ? value.split(',').map(t => t.trim()).filter(Boolean) : value;
                    if (Array.isArray(tagList) && tagList.length > 0) {
                        where.tags = { hasSome: tagList };
                    }
                } else if (typeof value === 'string' && value.length > 0) {
                    // Defensive check: Avoid 'contains' on UUID fields
                    const isUuidField = ['id', 'user_id', 'document_id', 'parent_document_id', 'original_document_id'].includes(filterKey);
                    if (isUuidField) {
                        // Only add the filter if it's a valid UUID to avoid Prisma errors
                        if (isUuid(value)) {
                            where[filterKey] = value;
                        }
                    } else {
                        where[filterKey] = { contains: value, mode: 'insensitive' };
                    }
                } else if (value !== undefined && value !== '') {
                    where[filterKey] = value;
                }
            }
        } catch (e) {
            console.error('[Admin API] Filter parse error:', e);
        }
    }

    try {
        // Fetch records + total count in parallel for efficiency
        const [records, total] = await Promise.all([
            model.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' },
            }),
            model.count({ where }),
        ]);

        return NextResponse.json({
            data: records.map(serializeRecord),
            total,
        });
    } catch (error) {
        console.error('[Admin API] getList error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
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

    try {
        const record = await model.create({ data: body });
        return NextResponse.json(serializeRecord(record), { status: 201 });
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
    const { id, ...data } = body;

    try {
        const record = await model.update({ where: { id }, data });
        return NextResponse.json(serializeRecord(record));
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

    try {
        await model.delete({ where: { id } });
        return NextResponse.json({ id });
    } catch (error) {
        console.error('[Admin API] delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Converts BigInt → number and Date → ISO string for JSON serialization
function serializeRecord(record: any): any {
    if (record === null || record === undefined) return record;
    const serialized: any = {};
    for (const [key, value] of Object.entries(record)) {
        if (typeof value === 'bigint') {
            serialized[key] = Number(value);
        } else if (value instanceof Date) {
            serialized[key] = value.toISOString();
        } else {
            serialized[key] = value;
        }
    }
    return serialized;
}

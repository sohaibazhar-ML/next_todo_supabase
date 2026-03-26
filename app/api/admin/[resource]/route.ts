/**
 * Admin CRUD API Route — /api/admin/[resource]
 * 
 * Handles all React Admin data operations using Prisma.
 * Every request is authorized (must be admin or subadmin).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, isSubadmin } from '@/utils/roles';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Whitelist of resources that can be accessed via this API
const ALLOWED_RESOURCES = ['profiles', 'users', 'documents', 'download_logs', 'user_document_versions', 'documents-list', 'stats', 'settings'] as const;
type ResourceName = typeof ALLOWED_RESOURCES[number];

function isAllowedResource(resource: string): resource is ResourceName {
    return ALLOWED_RESOURCES.includes(resource as ResourceName);
}

// Maps resource name → Prisma model delegate
function getPrismaModel(resource: ResourceName) {
    const models: Record<ResourceName, Prisma.profilesDelegate<any> | Prisma.documentsDelegate<any> | Prisma.download_logsDelegate<any> | Prisma.user_document_versionsDelegate<any>> = {
        profiles: prisma.profiles,
        users: prisma.profiles, // Alias for profiles
        documents: prisma.documents,
        'documents-list': prisma.documents,
        download_logs: prisma.download_logs,
        user_document_versions: prisma.user_document_versions,
        stats: prisma.profiles, // Dummy mapping for custom view
        settings: prisma.profiles, // Dummy mapping for custom view
    };
    return models[resource] as any; // Cast to any here is acceptable as it's the bridge to generic Prisma calls
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
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Fetch counts sequentially to avoid connection pool exhaustion (P1001)
            // On some Supabase tiers, parallel heavy counts can trigger pooler timeouts
            const totalUsers = await prisma.profiles.count().catch(err => {
                console.error('[Admin API] Error counting profiles:', err);
                return 0;
            });
            
            const totalDocuments = await prisma.documents.count().catch(err => {
                console.error('[Admin API] Error counting documents:', err);
                return 0;
            });
            
            const totalDownloads = await prisma.download_logs.count().catch(err => {
                console.error('[Admin API] Error counting total downloads:', err);
                return 0;
            });
            
            const recentDownloads = await prisma.download_logs.count({
                where: { downloaded_at: { gte: thirtyDaysAgo } }
            }).catch(err => {
                console.error('[Admin API] Error counting recent downloads:', err);
                return 0;
            });

            return NextResponse.json({
                totalUsers,
                totalDocuments,
                totalDownloads,
                recentDownloads
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
    const includes: Record<string, any> = {
        download_logs: {
            documents: { select: { title: true } },
            profiles: { select: { username: true, email: true } }
        }
    };
    const include = includes[resource];

    // Single record by ID
    if (id) {
        try {
            if (!isUuid(id)) {
                return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
            }
            const record = await model.findUnique({ 
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
    let where: Record<string, unknown> = {};
    if (filterParam) {
        try {
            const filters = JSON.parse(filterParam);
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
                        { version: { contains: q, mode: 'insensitive' } },
                        { google_drive_template_id: { contains: q, mode: 'insensitive' } },
                        { searchable_content: { contains: q, mode: 'insensitive' } },
                    ];
                } else if (resource === 'profiles' || resource === 'users') {
                    where.OR = [
                        { first_name: { contains: q, mode: 'insensitive' } },
                        { last_name: { contains: q, mode: 'insensitive' } },
                        { email: { contains: q, mode: 'insensitive' } },
                        { username: { contains: q, mode: 'insensitive' } },
                        { role: { contains: q, mode: 'insensitive' } },
                        { current_address: { contains: q, mode: 'insensitive' } },
                        { country_of_origin: { contains: q, mode: 'insensitive' } },
                        { phone_number: { contains: q, mode: 'insensitive' } },
                        { pets_type: { contains: q, mode: 'insensitive' } },
                        { new_address_switzerland: { contains: q, mode: 'insensitive' } },
                    ];
                } else if (resource === 'download_logs') {
                    // Raw search for download logs across multiple fields
                    (where as any).OR = [
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
                        (where as any).OR.push({ ip_address: { equals: q } });
                    }
                } else {
                    // Fallback for other resources: only use 'equals' on 'id' if q is a UUID
                    // This prevents 500 errors when q is a name/string
                    if (isUuid(q)) {
                        (where as any).id = q;
                    }
                }
            }

            // Date Range Filtering (standard RA uses gte/lte prefix, custom dashboard used fromDate/toDate)
            const start = filters.fromDate || filters.gte_created_at;
            const end = filters.toDate || filters.lte_created_at;

            if (start || end) {
                (where as any).created_at = {};
                if (start) (where as any).created_at.gte = new Date(start);
                if (end) (where as any).created_at.lte = new Date(end);
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
                            (where as any)[filterKey] = value;
                        }
                    } else {
                        (where as any)[filterKey] = { contains: value, mode: 'insensitive' };
                    }
                } else if (value !== undefined && value !== '') {
                    (where as any)[filterKey] = value;
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
                include,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' },
            }),
            model.count({ where }),
        ]);

        return NextResponse.json({
            data: records.map((r: unknown) => serializeRecord(r, resource)),
            total,
        });
    } catch (error) {
        console.error('[Admin API] getList error catch:', error);
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
// Optionally flattens relations for specific resources
function serializeRecord(record: unknown, resource?: string): any {
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

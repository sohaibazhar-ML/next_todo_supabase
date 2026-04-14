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
import { COUNTRIES } from '@/app/_components/admin/constants/countries';

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
                            { version: { contains: q, mode: 'insensitive' } },
                            { google_drive_template_id: { contains: q, mode: 'insensitive' } },
                            { searchable_content: { contains: q, mode: 'insensitive' } },
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

                    if (key === 'tags' && resource === 'documents') {
                        const tagList = typeof value === 'string' ? value.split(',').map(t => t.trim()).filter(Boolean) : value;
                        if (Array.isArray(tagList) && tagList.length > 0) where.tags = { hasSome: tagList };
                    } else if (key === 'role' && (resource === 'profiles' || resource === 'users')) {
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

    // DIAGNOSTIC LOG: This will show in your terminal exactly what Prisma is looking for
    if (Object.keys(where).length > 0) {
        console.log(`[Admin API] Final WHERE clause for ${resource}:`, JSON.stringify(where, null, 2));
    } else {
        console.warn(`[Admin API] WARNING: Empty WHERE clause for ${resource} request with filters:`, filterParam);
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

// SECURITY: Whitelist of fields allowed for each resource to prevent mass assignment
const RESOURCE_FIELD_WHITELISTS: Record<ResourceName, string[]> = {
    profiles: ['first_name', 'last_name', 'role', 'current_address', 'country_of_origin', 'phone_number', 'number_of_adults', 'number_of_children', 'pets_type', 'new_address_switzerland', 'marketing_consent', 'terms_accepted', 'data_privacy_accepted', 'keep_me_logged_in', 'admin_notes'],
    users: ['first_name', 'last_name', 'role', 'current_address', 'country_of_origin', 'phone_number', 'number_of_adults', 'number_of_children', 'pets_type', 'new_address_switzerland', 'marketing_consent', 'terms_accepted', 'data_privacy_accepted', 'keep_me_logged_in', 'admin_notes'],
    documents: ['title', 'description', 'category', 'tags', 'is_active', 'is_featured', 'file_name', 'file_path', 'file_size', 'file_type', 'mime_type', 'version', 'parent_document_id', 'google_drive_template_id', 'searchable_content'],
    'documents-list': ['title', 'description', 'category', 'tags', 'is_active', 'is_featured'],
    download_logs: [], // Usually read-only via this API
    user_document_versions: ['is_draft', 'version_name', 'html_content'],
    stats: [], // Read-only
    settings: [], // Custom
};

function whitelistFields(data: any, resource: ResourceName): any {
    const allowedFields = RESOURCE_FIELD_WHITELISTS[resource];
    if (!allowedFields || allowedFields.length === 0) return data;
    
    const cleanData: any = {};
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
        const record = await model.create({ data });
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
        const record = await model.update({ where: { id }, data });
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

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
const ALLOWED_RESOURCES = ['profiles', 'documents', 'download_logs', 'subadmin_permissions', 'user_document_versions'] as const;
type ResourceName = typeof ALLOWED_RESOURCES[number];

function isAllowedResource(resource: string): resource is ResourceName {
    return ALLOWED_RESOURCES.includes(resource as ResourceName);
}

// Maps resource name → Prisma model delegate
function getPrismaModel(resource: ResourceName) {
    const models: Record<ResourceName, any> = {
        profiles: prisma.profiles,
        documents: prisma.documents,
        download_logs: prisma.download_logs,
        subadmin_permissions: prisma.subadmin_permissions,
        user_document_versions: prisma.user_document_versions,
    };
    return models[resource];
}

// Shared auth check — verifies session + admin/subadmin role
async function authorize(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { authorized: false as const, status: 401, message: 'Unauthorized' };
    }

    const userIsAdmin = await isAdmin(user.id);
    const userIsSubadmin = await isSubadmin(user.id);

    if (!userIsAdmin && !userIsSubadmin) {
        return { authorized: false as const, status: 403, message: 'Forbidden' };
    }

    return { authorized: true as const, user, isAdmin: userIsAdmin };
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
            const idList = JSON.parse(ids);
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

    // Build Prisma where clause from filters (string = case-insensitive search)
    let where: any = {};
    if (filterParam) {
        try {
            const filters = JSON.parse(filterParam);
            for (const [key, value] of Object.entries(filters)) {
                if (typeof value === 'string') {
                    where[key] = { contains: value, mode: 'insensitive' };
                } else {
                    where[key] = value;
                }
            }
        } catch (e) {
            // Ignore invalid filter JSON
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

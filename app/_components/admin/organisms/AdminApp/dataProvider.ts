import { DataProvider, fetchUtils } from 'react-admin';

/**
 * Base URL for the Prisma-based admin CRUD API.
 * All requests are routed to /api/admin/[resource] where [resource]
 * maps to a Prisma model (e.g., profiles, documents, download_logs).
 */
const apiUrl = '/api/admin';

/**
 * HTTP client wrapper using React Admin's built-in fetchJson utility.
 * Automatically handles JSON parsing and error responses.
 * Cookies (Supabase session) are sent automatically by the browser.
 */
const httpClient = async (url: string, options: fetchUtils.Options = {}) => {
    return fetchUtils.fetchJson(url, options);
};

/**
 * Custom Data Provider for React Admin.
 *
 * Instead of using PostgREST (which is blocked at the database schema level),
 * this provider communicates with a Prisma-based CRUD API at /api/admin/[resource].
 *
 * The API handles:
 * - Authentication: Verifies Supabase session from cookies
 * - Authorization: Checks user role (admin/subadmin) before processing
 * - Data access: Uses Prisma (direct DB connection) to query/mutate data
 *
 * Supported resources: profiles, documents, download_logs,
 *                      subadmin_permissions, user_document_versions
 */
export const dataProvider: DataProvider = {

    /**
     * Fetch a paginated, sorted, and filtered list of records.
     * Used by React Admin's <List> component.
     *
     * Query params sent to API:
     * - _page: Current page number (1-indexed)
     * - _perPage: Number of records per page
     * - _sortField: Column to sort by
     * - _sortOrder: 'ASC' or 'DESC'
     * - _filters: JSON-encoded filter object (optional)
     *
     * Returns: { data: Record[], total: number }
     */
    getList: async (resource, params) => {
        const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
        const { field, order } = params.sort || { field: 'created_at', order: 'DESC' };

        const query: Record<string, string> = {
            _page: String(page),
            _perPage: String(perPage),
            _sortField: field,
            _sortOrder: order,
        };

        // Attach filters if any are provided (e.g., search, category filter)
        if (params.filter && Object.keys(params.filter as Object).length > 0) {
            query._filters = JSON.stringify(params.filter);
        }

        const queryString = new URLSearchParams(query).toString();
        const url = `${apiUrl}/${resource}?${queryString}`;

        const { json } = await httpClient(url);
        return {
            data: json.data,
            total: json.total,
        };
    },

    /**
     * Fetch a single record by its ID.
     * Used by React Admin's <Edit> and <Show> components.
     *
     * Returns: { data: Record }
     */
    getOne: async (resource, params) => {
        const url = `${apiUrl}/${resource}?id=${params.id}`;
        const { json } = await httpClient(url);
        return { data: json };
    },

    /**
     * Fetch multiple records by their IDs in a single request.
     * Used internally by React Admin for reference fields.
     *
     * Returns: { data: Record[] }
     */
    getMany: async (resource, params) => {
        const url = `${apiUrl}/${resource}?ids=${JSON.stringify(params.ids)}`;
        const { json } = await httpClient(url);
        return { data: json };
    },

    /**
     * Fetch records related to another record via a foreign key.
     * Example: Fetch all download_logs where document_id = '123'.
     * Used by React Admin's <ReferenceManyField>.
     *
     * Returns: { data: Record[], total: number }
     */
    getManyReference: async (resource, params) => {
        const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
        const { field, order } = params.sort || { field: 'created_at', order: 'DESC' };

        // Merge the reference filter (target=id) with any additional filters
        const filters = {
            ...params.filter,
            [params.target]: params.id,
        };

        const query: Record<string, string> = {
            _page: String(page),
            _perPage: String(perPage),
            _sortField: field,
            _sortOrder: order,
            _filters: JSON.stringify(filters),
        };

        const queryString = new URLSearchParams(query).toString();
        const url = `${apiUrl}/${resource}?${queryString}`;

        const { json } = await httpClient(url);
        return {
            data: json.data,
            total: json.total,
        };
    },

    /**
     * Create a new record.
     * Used by React Admin's <Create> component.
     *
     * For 'documents', it uses FormData to support file uploads.
     * Returns: { data: Record } (the newly created record with its ID)
     */
    create: async (resource, params) => {
        if (resource === 'documents' && params.data.file) {
            const formData = new FormData();
            
            // Handle multiple files or a single file
            const files = Array.isArray(params.data.file) ? params.data.file : [params.data.file];
            
            files.forEach((fileObj: { rawFile?: File }) => {
                if (fileObj && fileObj.rawFile) {
                    formData.append('file', fileObj.rawFile);
                }
            });

            // Append other fields
            for (const [key, value] of Object.entries(params.data)) {
                if (key === 'file') continue;
                
                if (key === 'tags' && typeof value === 'string') {
                    formData.append(key, JSON.stringify(value.split(',').map(t => t.trim()).filter(Boolean)));
                } else if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            }
            
            const response = await fetch('/api/admin/documents/upload', {
                method: 'POST',
                body: formData,
            });
            const json = await response.json();
            if (!response.ok) throw new Error(json.error || 'Upload failed');
            
            const data = Array.isArray(json) ? json[0] : json;
            return { data };
        }

        const data = { ...params.data } as Record<string, unknown>;
        if (resource === 'documents' && typeof data.tags === 'string') {
            data.tags = (data.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean);
        }

        const { json } = await httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { data: json };
    },

    update: async (resource, params) => {
        const data = { id: params.id, ...params.data } as Record<string, unknown>;
        
        if (resource === 'documents' && typeof data.tags === 'string') {
            data.tags = (data.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean);
        }

        const { json } = await httpClient(`${apiUrl}/${resource}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { data: json };
    },

    /**
     * Update multiple records at once (e.g., bulk actions).
     * Implemented by sending individual PUT requests for each ID.
     *
     * Returns: { data: string[] } (array of updated IDs)
     */
    updateMany: async (resource, params) => {
        const responses = await Promise.all(
            params.ids.map((id) =>
                httpClient(`${apiUrl}/${resource}`, {
                    method: 'PUT',
                    body: JSON.stringify({ id, ...params.data }),
                })
            )
        );
        return { data: responses.map(({ json }) => json.id) };
    },

    /**
     * Delete a single record by ID.
     * Used by React Admin's delete button.
     *
     * Sends a DELETE request with ?id=xxx query param.
     * Returns: { data: { id: string } }
     */
    delete: async (resource, params) => {
        const { json } = await httpClient(`${apiUrl}/${resource}?id=${params.id}`, {
            method: 'DELETE',
        });
        return { data: json };
    },

    /**
     * Delete multiple records at once (e.g., bulk delete).
     * Implemented by sending individual DELETE requests for each ID.
     *
     * Returns: { data: string[] } (array of deleted IDs)
     */
    deleteMany: async (resource, params) => {
        const responses = await Promise.all(
            params.ids.map((id) =>
                httpClient(`${apiUrl}/${resource}?id=${id}`, {
                    method: 'DELETE',
                })
            )
        );
        return { data: responses.map(({ json }) => json.id) };
    },
};

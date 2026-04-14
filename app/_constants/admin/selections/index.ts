/**
 * Admin Selection Constants
 * 
 * Centralized source of truth for choices used in SelectInputs
 * and StatusChips across the admin panel.
 */

export const ADMIN_ROLES = [
    { id: 'user', name: 'User' },
    { id: 'subadmin', name: 'Subadmin' },
    { id: 'admin', name: 'Admin' },
] as const;

export const DOCUMENT_CATEGORIES = [
    { id: 'Personal', name: 'Personal' },
    { id: 'Legal', name: 'Legal' },
    { id: 'Financial', name: 'Financial' },
    { id: 'Medical', name: 'Medical' },
] as const;

export type AdminRole = typeof ADMIN_ROLES[number]['id'];
export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number]['id'];

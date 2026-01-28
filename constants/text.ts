/**
 * UI Text Constants
 * 
 * Centralized text strings for UI elements.
 * Makes it easy to update text and prepare for internationalization.
 */

export const UI_TEXT = {
    // Common button labels
    BUTTONS: {
        SAVE: 'Save',
        CANCEL: 'Cancel',
        DELETE: 'Delete',
        EDIT: 'Edit',
        CREATE: 'Create',
        UPDATE: 'Update',
        SUBMIT: 'Submit',
        CLOSE: 'Close',
        CONFIRM: 'Confirm',
        BACK: 'Back',
        NEXT: 'Next',
        PREVIOUS: 'Previous',
        UPLOAD: 'Upload',
        DOWNLOAD: 'Download',
        EXPORT: 'Export',
        IMPORT: 'Import',
        SEARCH: 'Search',
        FILTER: 'Filter',
        CLEAR: 'Clear',
        CLEAR_ALL: 'Clear All',
        RESET: 'Reset',
        APPLY: 'Apply',
        VIEW: 'View',
        PREVIEW: 'Preview',
        REMOVE: 'Remove',
        ADD: 'Add',
        COPY: 'Copy',
        DUPLICATE: 'Duplicate',
        ARCHIVE: 'Archive',
        RESTORE: 'Restore',
        ACTIVATE: 'Activate',
        DEACTIVATE: 'Deactivate',
        ENABLE: 'Enable',
        DISABLE: 'Disable',
        FEATURE: 'Feature',
        UNFEATURE: 'Unfeature',
        CONVERT: 'Convert',
    },

    // Loading states
    LOADING: {
        DEFAULT: 'Loading...',
        SAVING: 'Saving...',
        DELETING: 'Deleting...',
        UPLOADING: 'Uploading...',
        DOWNLOADING: 'Downloading...',
        PROCESSING: 'Processing...',
        UPDATING: 'Updating...',
        CREATING: 'Creating...',
        FETCHING: 'Fetching...',
    },

    // Tooltips
    TOOLTIPS: {
        EDIT: 'Edit this item',
        DELETE: 'Delete this item',
        VIEW: 'View details',
        DOWNLOAD: 'Download file',
        UPLOAD: 'Upload file',
        SEARCH: 'Search items',
        FILTER: 'Filter results',
        SORT: 'Sort items',
        REFRESH: 'Refresh data',
        SETTINGS: 'Open settings',
        HELP: 'Get help',
        CLOSE: 'Close',
        EXPAND: 'Expand',
        COLLAPSE: 'Collapse',
        COPY: 'Copy to clipboard',
        SHARE: 'Share',
    },

    // Placeholders
    PLACEHOLDERS: {
        SEARCH: 'Search...',
        SEARCH_DOCUMENTS: 'Search documents...',
        SEARCH_USERS: 'Search users...',
        EMAIL: 'Enter email address',
        PASSWORD: 'Enter password',
        NAME: 'Enter name',
        TITLE: 'Enter title',
        DESCRIPTION: 'Enter description',
        SELECT: 'Select an option',
        SELECT_FILE: 'Select a file',
        SELECT_DATE: 'Select a date',
        NO_SELECTION: 'No selection',
    },

    // Messages
    MESSAGES: {
        NO_DATA: 'No data available',
        NO_RESULTS: 'No results found',
        NO_ITEMS: 'No items to display',
        EMPTY_LIST: 'This list is empty',
        LOADING_ERROR: 'Failed to load data',
        SAVE_SUCCESS: 'Saved successfully',
        DELETE_SUCCESS: 'Deleted successfully',
        UPDATE_SUCCESS: 'Updated successfully',
        CREATE_SUCCESS: 'Created successfully',
        UPLOAD_SUCCESS: 'Uploaded successfully',
        GENERIC_ERROR: 'Something went wrong',
        NETWORK_ERROR: 'Network error occurred',
        PERMISSION_DENIED: 'Permission denied',
        NOT_FOUND: 'Not found',
        CONFIRM_DELETE: 'Are you sure you want to delete this item?',
        CONFIRM_CANCEL: 'Are you sure you want to cancel? Unsaved changes will be lost.',
        UNSAVED_CHANGES: 'You have unsaved changes',
        // Auth & User messages
        REGISTRATION_SUCCESS: 'Registration successful! Please check your email for confirmation.',
        PASSWORD_UPDATE_SUCCESS: 'Password updated successfully',
        PASSWORD_UPDATE_FAILED: 'Failed to update password',
        // Admin messages
        SAVE_SUBADMIN_FAILED: 'Failed to save subadmin',
        // Document messages
        FETCH_DOCUMENTS_FAILED: 'Failed to fetch documents',
        LOAD_PDF_FAILED: 'Failed to load PDF',
    },

    // Labels
    LABELS: {
        EMAIL: 'Email',
        PASSWORD: 'Password',
        NAME: 'Name',
        TITLE: 'Title',
        DESCRIPTION: 'Description',
        CATEGORY: 'Category',
        STATUS: 'Status',
        DATE: 'Date',
        TIME: 'Time',
        CREATED: 'Created',
        UPDATED: 'Updated',
        AUTHOR: 'Author',
        TAGS: 'Tags',
        FILE: 'File',
        SIZE: 'Size',
        TYPE: 'Type',
        ACTIONS: 'Actions',
        DETAILS: 'Details',
        SETTINGS: 'Settings',
        PERMISSIONS: 'Permissions',
        ROLE: 'Role',
        ACTIVE: 'Active',
        INACTIVE: 'Inactive',
        FEATURED: 'Featured',
    },

    // Pagination
    PAGINATION: {
        SHOWING: 'Showing',
        OF: 'of',
        ITEMS: 'items',
        PAGE: 'Page',
        PER_PAGE: 'Per page',
        FIRST: 'First',
        LAST: 'Last',
        NEXT: 'Next',
        PREVIOUS: 'Previous',
        GO_TO_PAGE: 'Go to page',
    },

    // Table
    TABLE: {
        NO_DATA: 'No data to display',
        LOADING: 'Loading data...',
        SELECT_ALL: 'Select all',
        SELECTED: 'selected',
        SORT_ASC: 'Sort ascending',
        SORT_DESC: 'Sort descending',
        CLEAR_SORT: 'Clear sort',
        CLEAR_FILTERS: 'Clear filters',
    },

    // Form validation
    VALIDATION: {
        REQUIRED: 'This field is required',
        INVALID_EMAIL: 'Invalid email address',
        INVALID_URL: 'Invalid URL',
        MIN_LENGTH: 'Minimum length is',
        MAX_LENGTH: 'Maximum length is',
        MIN_VALUE: 'Minimum value is',
        MAX_VALUE: 'Maximum value is',
        PASSWORDS_MUST_MATCH: 'Passwords must match',
        INVALID_FORMAT: 'Invalid format',
    },
} as const

export type UITextKeys = typeof UI_TEXT

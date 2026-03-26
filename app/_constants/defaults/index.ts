/**
 * Default values for the application
 */

export const DEFAULT_VALUES = {
    // Profile defaults
    NUMBER_OF_ADULTS: 1,
    NUMBER_OF_CHILDREN: 0,
    
    // File size formatting defaults
    FILE_SIZE_BASE: 1024,
    FILE_SIZE_ROUNDING: 10,
    FILE_SIZE_ZERO: '0',
    FILE_SIZE_UNITS: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
    
    // Default timeouts, etc.
} as const;

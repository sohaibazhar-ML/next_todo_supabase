/**
 * Theme Constants
 * 
 * Centralized theme values for consistent styling across the application.
 * Uses Tailwind CSS class names for easy integration.
 */

export const THEME = {
    // Colors (Tailwind classes)
    COLORS: {
        // Primary colors
        PRIMARY: {
            DEFAULT: 'indigo-600',
            LIGHT: 'indigo-500',
            DARK: 'indigo-700',
            BG: 'bg-indigo-600',
            TEXT: 'text-indigo-600',
            BORDER: 'border-indigo-600',
            HOVER_BG: 'hover:bg-indigo-700',
            HOVER_TEXT: 'hover:text-indigo-700',
        },

        // Secondary colors
        SECONDARY: {
            DEFAULT: 'purple-600',
            LIGHT: 'purple-500',
            DARK: 'purple-700',
            BG: 'bg-purple-600',
            TEXT: 'text-purple-600',
            BORDER: 'border-purple-600',
            HOVER_BG: 'hover:bg-purple-700',
            HOVER_TEXT: 'hover:text-purple-700',
        },

        // Status colors
        SUCCESS: {
            DEFAULT: 'green-600',
            LIGHT: 'green-500',
            DARK: 'green-700',
            BG: 'bg-green-600',
            TEXT: 'text-green-600',
            BORDER: 'border-green-600',
            LIGHT_BG: 'bg-green-50',
            LIGHT_TEXT: 'text-green-800',
        },

        DANGER: {
            DEFAULT: 'red-600',
            LIGHT: 'red-500',
            DARK: 'red-700',
            BG: 'bg-red-600',
            TEXT: 'text-red-600',
            BORDER: 'border-red-600',
            LIGHT_BG: 'bg-red-50',
            LIGHT_TEXT: 'text-red-800',
            HOVER_BG: 'hover:bg-red-700',
        },

        WARNING: {
            DEFAULT: 'yellow-600',
            LIGHT: 'yellow-500',
            DARK: 'yellow-700',
            BG: 'bg-yellow-600',
            TEXT: 'text-yellow-600',
            BORDER: 'border-yellow-600',
            LIGHT_BG: 'bg-yellow-50',
            LIGHT_TEXT: 'text-yellow-800',
        },

        INFO: {
            DEFAULT: 'blue-600',
            LIGHT: 'blue-500',
            DARK: 'blue-700',
            BG: 'bg-blue-600',
            TEXT: 'text-blue-600',
            BORDER: 'border-blue-600',
            LIGHT_BG: 'bg-blue-50',
            LIGHT_TEXT: 'text-blue-800',
        },

        // Neutral colors
        GRAY: {
            50: 'gray-50',
            100: 'gray-100',
            200: 'gray-200',
            300: 'gray-300',
            400: 'gray-400',
            500: 'gray-500',
            600: 'gray-600',
            700: 'gray-700',
            800: 'gray-800',
            900: 'gray-900',
        },

        // Utility colors
        WHITE: 'white',
        BLACK: 'black',
        TRANSPARENT: 'transparent',

        // Brand colors (Hex values)
        BRAND: {
            GOOGLE: {
                BLUE: '#4285F4',
                GREEN: '#34A853',
                YELLOW: '#FBBC05',
                RED: '#EA4335',
            },
        },

        // Annotation colors (Hex values)
        ANNOTATION: {
            HIGHLIGHT: '#ffff00', // Yellow
            WHITE: '#ffffff',
            BLACK: '#000000',
        },
    },

    // Spacing (Tailwind classes)
    SPACING: {
        XS: '0.5', // 2px
        SM: '1', // 4px
        MD: '1.5', // 6px
        LG: '2', // 8px
        XL: '3', // 12px
        '2XL': '4', // 16px
        '3XL': '6', // 24px
        '4XL': '8', // 32px
        '5XL': '12', // 48px
        '6XL': '16', // 64px
    },

    // Border radius (Tailwind classes)
    BORDER_RADIUS: {
        NONE: 'rounded-none',
        SM: 'rounded-sm',
        DEFAULT: 'rounded',
        MD: 'rounded-md',
        LG: 'rounded-lg',
        XL: 'rounded-xl',
        '2XL': 'rounded-2xl',
        '3XL': 'rounded-3xl',
        FULL: 'rounded-full',
    },

    // Shadows (Tailwind classes)
    SHADOWS: {
        NONE: 'shadow-none',
        SM: 'shadow-sm',
        DEFAULT: 'shadow',
        MD: 'shadow-md',
        LG: 'shadow-lg',
        XL: 'shadow-xl',
        '2XL': 'shadow-2xl',
        INNER: 'shadow-inner',
    },

    // Font sizes (Tailwind classes)
    FONT_SIZES: {
        XS: 'text-xs',
        SM: 'text-sm',
        BASE: 'text-base',
        LG: 'text-lg',
        XL: 'text-xl',
        '2XL': 'text-2xl',
        '3XL': 'text-3xl',
        '4XL': 'text-4xl',
        '5XL': 'text-5xl',
    },

    // Font weights (Tailwind classes)
    FONT_WEIGHTS: {
        THIN: 'font-thin',
        LIGHT: 'font-light',
        NORMAL: 'font-normal',
        MEDIUM: 'font-medium',
        SEMIBOLD: 'font-semibold',
        BOLD: 'font-bold',
        EXTRABOLD: 'font-extrabold',
    },

    // Transitions (Tailwind classes)
    TRANSITIONS: {
        NONE: 'transition-none',
        ALL: 'transition-all',
        DEFAULT: 'transition',
        COLORS: 'transition-colors',
        OPACITY: 'transition-opacity',
        SHADOW: 'transition-shadow',
        TRANSFORM: 'transition-transform',
        DURATION_75: 'duration-75',
        DURATION_100: 'duration-100',
        DURATION_150: 'duration-150',
        DURATION_200: 'duration-200',
        DURATION_300: 'duration-300',
        DURATION_500: 'duration-500',
        DURATION_700: 'duration-700',
        DURATION_1000: 'duration-1000',
    },

    // Z-index values
    Z_INDEX: {
        DROPDOWN: 'z-50',
        MODAL: 'z-50',
        OVERLAY: 'z-40',
        HEADER: 'z-30',
        SIDEBAR: 'z-20',
        DEFAULT: 'z-10',
        BELOW: 'z-0',
    },

    // Common gradients
    GRADIENTS: {
        PRIMARY: 'bg-gradient-to-r from-indigo-600 to-purple-600',
        PRIMARY_HOVER: 'hover:from-indigo-700 hover:to-purple-700',
        DANGER: 'bg-gradient-to-r from-red-500 to-red-600',
        SUCCESS: 'bg-gradient-to-r from-green-600 to-emerald-600',
        WARNING: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        INFO: 'bg-gradient-to-r from-blue-600 to-cyan-600',
        SUBTLE: 'bg-gradient-to-br from-gray-50 to-indigo-50/30',
    },

    // Common component styles
    COMPONENTS: {
        CARD: {
            DEFAULT: 'bg-white rounded-xl shadow-sm border border-gray-200',
            HOVER: 'hover:shadow-md transition-shadow',
            PADDING: 'p-6',
        },
        INPUT: {
            DEFAULT: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            ERROR: 'border-red-500 focus:ring-red-500 focus:border-red-500',
            DISABLED: 'bg-gray-100 cursor-not-allowed opacity-50',
        },
        BADGE: {
            DEFAULT: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            PRIMARY: 'bg-indigo-100 text-indigo-800',
            SUCCESS: 'bg-green-100 text-green-800',
            DANGER: 'bg-red-100 text-red-800',
            WARNING: 'bg-yellow-100 text-yellow-800',
            INFO: 'bg-blue-100 text-blue-800',
            GRAY: 'bg-gray-100 text-gray-800',
        },
    },
} as const

export type ThemeKeys = typeof THEME

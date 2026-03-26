"use client";
import React from 'react';
import * as MuiIcons from '@mui/icons-material';
import { HelpCircle, LucideProps } from 'lucide-react';

/**
 * AdaptiveIcon Atom
 * 
 * A universal icon wrapper that supports both Material UI Icons (for Admin) 
 * and Lucide Icons (for Website). This eliminates the need for inline SVGs 
 * and ensures a consistent icon API across the entire project.
 */
export type IconName = keyof typeof MuiIcons;


interface AdaptiveIconProps {
    name?: IconName;
    lucide?: React.ComponentType<LucideProps>;
    size?: number | string;
    color?: string;
    className?: string;
}


export const AdaptiveIcon = ({
    name,
    lucide: Lucide,
    size = 24,
    color,
    className
}: AdaptiveIconProps) => {
    // If a Lucide icon is explicitly provided, use it (preferred for Website)
    if (Lucide) {
        return <Lucide size={size} color={color} className={className} />;
    }

    // Otherwise, try to find the MuiIcon by name
    if (name) {
        // Use a type-safe lookup for MuiIcons
        const MuiIcon = MuiIcons[name] as React.ComponentType<{ sx?: object; className?: string }> | undefined;
        if (MuiIcon) {
            return <MuiIcon sx={{ fontSize: size, color }} className={className} />;
        }
    }

    // Fallback icon
    return <HelpCircle size={size} color={color} className={className} />;
};

export default AdaptiveIcon;

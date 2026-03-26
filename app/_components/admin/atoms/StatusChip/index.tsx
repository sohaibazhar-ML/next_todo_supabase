"use client";
import React from 'react';
import { Chip } from '@mui/material';
import { StatusChipProps } from '@/admin/atoms/StatusChip/StatusChip.types';

/**
 * StatusChip Atom
 * 
 * A professional badge component that standardizes how statuses and roles
 * are displayed. It automatically maps values to appropriate colors and labels.
 */
import { getStatusMapping } from '@/admin/utils';

/**
 * StatusChip Atom
 * 
 * A professional badge component that standardizes how statuses and roles
 * are displayed. It uses a centralized utility to map values to appropriate 
 * colors and labels, keeping the component purely presentational.
 */
export const StatusChip = ({ value, type = 'status', ...props }: StatusChipProps) => {
    const { label, color } = getStatusMapping(value, type);

    return (
        <Chip 
            label={label} 
            color={color} 
            size="small" 
            variant="outlined" 
            {...props} 
        />
    );
};

export default StatusChip;

"use client";
import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { StatusChipProps } from './StatusChip.types';

/**
 * StatusChip Atom
 * 
 * A professional badge component that standardizes how statuses and roles
 * are displayed. It automatically maps values to appropriate colors and labels.
 */
export const StatusChip = ({ value, type = 'status', ...props }: StatusChipProps) => {
    let label = String(value);
    let color: ChipProps['color'] = 'default';

    if (type === 'role') {
        const role = String(value).toLowerCase();
        label = role.charAt(0).toUpperCase() + role.slice(1);
        if (role === 'admin') color = 'primary';
        else if (role === 'subadmin') color = 'secondary';
        else color = 'default';
    } else if (type === 'boolean' || typeof value === 'boolean') {
        label = value ? 'Yes' : 'No';
        color = value ? 'success' : 'error';
    } else {
        const status = String(value).toLowerCase();
        label = status.charAt(0).toUpperCase() + status.slice(1);
        if (status === 'active' || status === 'true') color = 'success';
        else if (status === 'inactive' || status === 'false') color = 'error';
        else if (status === 'pending') color = 'warning';
    }

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

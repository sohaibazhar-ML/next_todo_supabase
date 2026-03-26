import { ChipProps } from '@mui/material';

/**
 * Status Mapping Utility
 * 
 * Logic for mapping raw status/role values to human-readable labels 
 * and MUI colors. Used by StatusChip to maintain pure presentation.
 */

export type StatusType = 'status' | 'role' | 'boolean';

interface StatusMapping {
    label: string;
    color: ChipProps['color'];
}

export const getStatusMapping = (value: unknown, type: StatusType = 'status'): StatusMapping => {
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

    return { label, color };
};

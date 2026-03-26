import { ChipProps } from '@mui/material';

export interface StatusChipProps extends Omit<ChipProps, 'color'> {
    value: string | boolean;
    type?: 'role' | 'status' | 'boolean';
}

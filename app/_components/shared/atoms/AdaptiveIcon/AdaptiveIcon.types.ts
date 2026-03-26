import React from 'react';
import * as MuiIcons from '@mui/icons-material';
import { LucideProps } from 'lucide-react';

export type IconName = keyof typeof MuiIcons;

export interface AdaptiveIconProps {
    name?: IconName;
    lucide?: React.ComponentType<LucideProps>;
    size?: number | string;
    color?: string;
    className?: string;
}

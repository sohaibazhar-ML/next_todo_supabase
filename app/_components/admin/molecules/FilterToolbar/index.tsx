"use client";
import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    TextField, 
    Menu, 
    MenuItem, 
    IconButton, 
    Checkbox, 
    ListItemText 
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export interface FilterDefinition {
    source: string;
    label: string;
    type: string;
}

/**
 * Filter Values Type
 * 
 * Strict typing for active filter values to avoid unsfae 'unknown' casting.
 */
export type FilterValues = Record<string, string | number | boolean | undefined>;

interface CustomFilterToolbarProps {
    filters: FilterDefinition[];
    activeValues: FilterValues;
    onFilterChange: (name: string, value: string) => void;
    onToggleFilter: (name: string, active: boolean) => void;
    activeFilters: Set<string>;
    onExport?: () => void;
}

/**
 * CustomFilterToolbar Molecule
 * 
 * Shared administrative toolbar for filtering and exporting data.
 * Harden with strict typing and declarative handlers.
 */
export const CustomFilterToolbar = ({ 
    filters, 
    activeValues, 
    onFilterChange, 
    onToggleFilter,
    activeFilters,
    onExport 
}: CustomFilterToolbarProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const handleToggle = (name: string) => {
        onToggleFilter(name, !activeFilters.has(name));
    };

    return (
        <Box mb={4} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box display="flex" gap={2} alignItems="center">
                {filters.map(filter => {
                    if (!activeFilters.has(filter.source)) return null;
                    return (
                        <Box key={filter.source} display="flex" alignItems="center" gap={0.5}>
                            <TextField
                                label={filter.label}
                                type={filter.type}
                                variant="filled"
                                value={String(activeValues[filter.source] ?? '')}
                                onChange={(e) => onFilterChange(filter.source, e.target.value)}
                                size="small"
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={{ width: 180 }}
                            />
                            <IconButton size="small" onClick={() => onToggleFilter(filter.source, false)} sx={{ mb: -2 }}>
                                <RemoveCircleOutlineIcon fontSize="inherit" color="disabled" />
                            </IconButton>
                        </Box>
                    );
                })}
            </Box>

            <Box display="flex" gap={1}>
                <Button
                    variant="text"
                    color="primary"
                    startIcon={<FilterListIcon />}
                    onClick={handleOpenMenu}
                    size="small"
                    sx={{ fontWeight: 500, textTransform: 'uppercase' }}
                >
                    Add Filter
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                    {filters.map(filter => (
                        <MenuItem key={filter.source} onClick={() => handleToggle(filter.source)}>
                            <Checkbox checked={activeFilters.has(filter.source)} size="small" />
                            <ListItemText primary={filter.label} />
                        </MenuItem>
                    ))}
                </Menu>

                {onExport && (
                    <Button 
                        variant="text" 
                        color="primary" 
                        startIcon={<DownloadIcon />}
                        onClick={onExport}
                        size="small"
                        sx={{ 
                            whiteSpace: 'nowrap',
                            minWidth: 'max-content',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                            padding: '4px 8px',
                        }}
                    >
                        Export
                    </Button>
                )}
            </Box>
        </Box>
    );
};

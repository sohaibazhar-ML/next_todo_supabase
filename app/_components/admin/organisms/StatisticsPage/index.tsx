"use client";
import React, { useState } from 'react';
import { Title } from 'react-admin';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stack
} from '@mui/material';
import { StatisticsDashboard } from '@/admin/organisms/StatisticsDashboard';
import { useAdminStats } from '@/admin/hooks';

export const StatisticsPage = () => {
    // Global Dashboard Filters (controlled by Sidebar)
    const [dashboardFilters, setDashboardFilters] = useState<{ startDate?: string, endDate?: string }>({
        // Default to last 30 days
        endDate: new Date().toISOString().split('T')[0],
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    // Fetch data with filters
    const { data: stats, isLoading, error } = useAdminStats(dashboardFilters);

    // UI Display Mode (Absolute vs Percent)
    const [displayMode, setDisplayMode] = useState<'absolute' | 'percent'>('absolute');

    // Handle updates from sidebar (date range only — file type filtering is handled inside the dashboard)
    const handleApplyFilters = (newFilters: { startDate?: string, endDate?: string, fileType?: string }) => {
        setDashboardFilters({
            startDate: newFilters.startDate,
            endDate: newFilters.endDate
        });
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={8} sx={{ height: '60vh' }}>
                <CircularProgress sx={{ color: '#2196F3' }} />
            </Box>
        );
    }

    if (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return <Box p={3}><Alert severity="error">Error loading statistics: {errorMessage}</Alert></Box>;
    }

    return (
        <Box p={4}>
            <Title title="Admin Dashboard" />

            {/* Design-Matched Header */}
            <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ color: '#333' }}>
                        Admin Dashboard
                    </Typography>
                </Box>

                {/* Reference-Matched Toggle & Menu */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Paper
                        elevation={0}
                        sx={{
                            p: 0.5,
                            borderRadius: '30px',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: '#f5f5f5',
                            display: 'flex',
                            cursor: 'pointer'
                        }}
                    >
                        <Box 
                            onClick={() => setDisplayMode('absolute')}
                            sx={{ 
                                px: 2, 
                                py: 0.5, 
                                borderRadius: '20px', 
                                bgcolor: displayMode === 'absolute' ? 'white' : 'transparent', 
                                border: displayMode === 'absolute' ? '1px solid #ddd' : '1px solid transparent',
                                opacity: displayMode === 'absolute' ? 1 : 0.5,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Typography variant="caption" fontWeight="700">Absolute</Typography>
                        </Box>
                        <Box 
                            onClick={() => setDisplayMode('percent')}
                            sx={{ 
                                px: 2, 
                                py: 0.5, 
                                borderRadius: '20px', 
                                bgcolor: displayMode === 'percent' ? 'white' : 'transparent', 
                                border: displayMode === 'percent' ? '1px solid #ddd' : '1px solid transparent',
                                opacity: displayMode === 'percent' ? 1 : 0.5,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Typography variant="caption" fontWeight="700">Percent</Typography>
                        </Box>
                    </Paper>
                    <Box sx={{ p: 1, borderRadius: '50%', '&:hover': { bgcolor: 'divider' }, cursor: 'pointer' }}>
                        <Typography variant="h6" sx={{ lineWeight: 1 }}>•••</Typography>
                    </Box>
                </Stack>
            </Box>

            {stats && (
                <StatisticsDashboard
                    statistics={stats}
                    displayMode={displayMode}
                    onApplyFilters={handleApplyFilters}
                />
            )}
        </Box>
    );
};




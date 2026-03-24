import React, { useEffect, useState } from 'react';
import { Title } from 'react-admin';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import MuiStatisticsCards from './MuiStatisticsCards';

const StatisticsPage = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to fetch statistics');
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Box p={2}><Alert severity="error">Error: {error}</Alert></Box>;
    }

    return (
        <Box p={3}>
            <Title title="Statistics" />
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Statistics
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Detailed performance metrics and trends
                </Typography>
            </Box>

            {stats && <MuiStatisticsCards statistics={stats} />}
            
            <Box mt={4}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Performance Overview
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        The metrics above represent the current snapshot of projects, tasks, and team productivity.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default StatisticsPage;

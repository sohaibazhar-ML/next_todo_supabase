import React, { useEffect, useState } from 'react';
import { useTranslate } from 'react-admin';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import MuiStatisticsCards from './MuiStatisticsCards';

const Dashboard = () => {
    const t = useTranslate();
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

    if (!stats) return null;

    return (
        <Box p={3}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Overview of your application's activity
                </Typography>
            </Box>
            
            <MuiStatisticsCards statistics={stats} />
        </Box>
    );
};

export default Dashboard;

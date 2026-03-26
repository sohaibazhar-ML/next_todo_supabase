import { Title } from 'react-admin';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { StatisticsDashboard as MuiStatisticsCards } from '@/admin/organisms/StatisticsDashboard';
import { useAdminStats } from '@/admin/hooks';

export const StatisticsPage = () => {
    const { data: stats, isLoading, error } = useAdminStats();

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return <Box p={2}><Alert severity="error">Error: {errorMessage}</Alert></Box>;
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
                        The metrics above represent real-time administrative activity, including user registrations, document management, and download history.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};



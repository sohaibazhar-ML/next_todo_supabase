"use client";
import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { StatisticsData } from '@/types';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HistoryIcon from '@mui/icons-material/History';

interface MuiStatisticsCardsProps {
    statistics: StatisticsData;
}

const DASHBOARD_CARDS = [
    {
        title: 'Total Users',
        source: 'totalUsers',
        subtitle: 'Registered Profiles',
        icon: PeopleIcon,
        color: 'primary.light',
        iconColor: 'primary.main',
    },
    {
        title: 'Total Documents',
        source: 'totalDocuments',
        subtitle: 'Uploads & Versions',
        icon: DescriptionIcon,
        color: 'secondary.light',
        iconColor: 'secondary.main',
    },
    {
        title: 'Total Downloads',
        source: 'totalDownloads',
        subtitle: 'Lifetime Activity',
        icon: FileDownloadIcon,
        color: 'success.light',
        iconColor: 'success.main',
    },
    {
        title: 'Recent Activity',
        source: 'recentDownloads',
        subtitle: 'Downloads (Last 30 Days)',
        icon: HistoryIcon,
        color: 'warning.light',
        iconColor: 'warning.main',
    },
] as const;

export const StatisticsDashboard = ({ statistics }: MuiStatisticsCardsProps) => {
    return (
        <Grid container spacing={3}>
            {DASHBOARD_CARDS.map((card) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
                    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                                        {card.title}
                                    </Typography>
                                    <Typography variant="h4" component="div" fontWeight="bold">
                                        {statistics[card.source as keyof StatisticsData]}
                                    </Typography>
                                    <Typography color="textSecondary" variant="body2" sx={{ mt: 1 }}>
                                        {card.subtitle}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        backgroundColor: card.color,
                                        borderRadius: '12px',
                                        p: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0.8
                                    }}
                                >
                                    <card.icon sx={{ fontSize: 40, color: card.iconColor }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

// export default MuiStatisticsCards;

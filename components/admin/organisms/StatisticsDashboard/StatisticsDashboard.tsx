"use client";
import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { StatisticsData } from '@/features/admin/stats/types';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HistoryIcon from '@mui/icons-material/History';

interface MuiStatisticsCardsProps {
    statistics: StatisticsData;
}

export const StatisticsDashboard = ({ statistics }: MuiStatisticsCardsProps) => {
    const cards = [
        {
            title: 'Total Users',
            value: statistics.totalUsers,
            subtitle: 'Registered Profiles',
            icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
            color: 'primary.light',
        },
        {
            title: 'Total Documents',
            value: statistics.totalDocuments,
            subtitle: 'Uploads & Versions',
            icon: <DescriptionIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
            color: 'secondary.light',
        },
        {
            title: 'Total Downloads',
            value: statistics.totalDownloads,
            subtitle: 'Lifetime Activity',
            icon: <FileDownloadIcon sx={{ fontSize: 40, color: 'success.main' }} />,
            color: 'success.light',
        },
        {
            title: 'Recent Activity',
            value: statistics.recentDownloads,
            subtitle: 'Downloads (Last 30 Days)',
            icon: <HistoryIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
            color: 'warning.light',
        },
    ];

    return (
        <Grid container spacing={3}>
            {cards.map((card) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
                    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                                        {card.title}
                                    </Typography>
                                    <Typography variant="h4" component="div" fontWeight="bold">
                                        {card.value}
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
                                    {card.icon}
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

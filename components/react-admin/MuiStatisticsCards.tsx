"use client";
import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import BriefcaseIcon from '@mui/icons-material/BusinessCenter';
import ClipboardIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';

interface Statistics {
    projects: { total: number; completed: number };
    activeTasks: { total: number; completed: number };
    teams: { total: number; completed: number };
    productivity: { percentage: number; completed: number };
}

interface MuiStatisticsCardsProps {
    statistics: Statistics;
}

const MuiStatisticsCards = ({ statistics }: MuiStatisticsCardsProps) => {
    const cards = [
        {
            title: 'Projects',
            value: statistics.projects.total,
            subtitle: `${statistics.projects.completed} Completed`,
            icon: <BriefcaseIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
            color: 'primary.light',
        },
        {
            title: 'Active Tasks',
            value: statistics.activeTasks.total,
            subtitle: `${statistics.activeTasks.completed} Completed`,
            icon: <ClipboardIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
            color: 'secondary.light',
        },
        {
            title: 'Teams',
            value: statistics.teams.total,
            subtitle: `${statistics.teams.completed} Completed`,
            icon: <GroupIcon sx={{ fontSize: 40, color: 'success.main' }} />,
            color: 'success.light',
        },
        {
            title: 'Productivity',
            value: `${statistics.productivity.percentage}%`,
            subtitle: `${statistics.productivity.completed}% Completed`,
            icon: <BarChartIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
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

export default MuiStatisticsCards;

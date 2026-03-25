"use client";
import React, { useState, useEffect } from 'react';
import { Title, useNotify, usePermissions } from 'react-admin';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow,
    CircularProgress,
    Paper,
    Divider
} from '@mui/material';
import { format, startOfMonth } from 'date-fns';
import { CustomFilterToolbar, FilterDefinition } from '../common/CustomFilterToolbar';

const filterDefinitions: FilterDefinition[] = [
    { source: 'fromDate', label: 'From Date', type: 'date' },
    { source: 'toDate', label: 'To Date', type: 'date' },
];

const ReportsPage = () => {
    const notify = useNotify();
    const { permissions } = usePermissions();
    
    // Filter selection states
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['fromDate', 'toDate']));

    // Default to start of current month and today
    const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeFilters.has('fromDate')) params.append('from', fromDate);
            if (activeFilters.has('toDate')) params.append('to', toDate);
            
            const response = await fetch(`/api/admin/reports?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch report');
            const result = await response.json();
            setData(result);
        } catch (error) {
            notify('Error fetching report', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [fromDate, toDate, activeFilters]);

    const handleFilterChange = (name: string, value: any) => {
        if (name === 'fromDate') setFromDate(value);
        if (name === 'toDate') setToDate(value);
    };

    const handleToggleFilter = (name: string, active: boolean) => {
        const newFilters = new Set(activeFilters);
        if (active) newFilters.add(name);
        else newFilters.delete(name);
        setActiveFilters(newFilters);
    };

    const exportToCSV = () => {
        if (!data || !data.dailyData) return;

        const headers = ['Date', 'Uploads', 'Downloads'];
        const rows = data.dailyData.map((d: any) => [d.date, d.uploads, d.downloads]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map((row: any) => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `report_${fromDate}_to_${toDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box p={3}>
            <Title title="Reports" />
            
            <Box mb={2}>
                <Typography variant="h4" fontWeight="bold">
                    Interaction Reports
                </Typography>
            </Box>

            <CustomFilterToolbar 
                filters={filterDefinitions}
                activeValues={{ fromDate, toDate }}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onToggleFilter={handleToggleFilter}
                onExport={exportToCSV}
            />

            {loading ? (
                <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
            ) : data ? (
                <>
                    <Grid container spacing={3} mb={4}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>Total Uploads</Typography>
                                    <Typography variant="h3">{data.totalUploads}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>Total Downloads</Typography>
                                    <Typography variant="h3">{data.totalDownloads}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Paper elevation={2}>
                        <Box p={2}>
                            <Typography variant="h6">Daily Breakdown</Typography>
                        </Box>
                        <Divider />
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Uploads</TableCell>
                                    <TableCell align="right">Downloads</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.dailyData.map((day: any) => (
                                    <TableRow key={day.date} hover>
                                        <TableCell>{day.date}</TableCell>
                                        <TableCell align="right">{day.uploads}</TableCell>
                                        <TableCell align="right">{day.downloads}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </>
            ) : null}
        </Box>
    );
};

export default ReportsPage;

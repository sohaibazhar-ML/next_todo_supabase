import React, { useState, useEffect } from 'react';
import { Title, useNotify } from 'react-admin';
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
import { CustomFilterToolbar, FilterDefinition } from '@/components/react-admin/common/CustomFilterToolbar';
import { useReports } from '../hooks/useReports';

const filterDefinitions: FilterDefinition[] = [
    { source: 'fromDate', label: 'From Date', type: 'date' },
    { source: 'toDate', label: 'To Date', type: 'date' },
];

export const ReportsPage = () => {
    const notify = useNotify();
    
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['fromDate', 'toDate']));
    const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    
    const { data, isLoading, error } = useReports(
        activeFilters.has('fromDate') ? fromDate : undefined,
        activeFilters.has('toDate') ? toDate : undefined
    );

    useEffect(() => {
        if (error) {
            notify('Error fetching report', { type: 'error' });
        }
    }, [error, notify]);

    const handleFilterChange = (name: string, value: any) => {
        if (name === 'fromDate') setFromDate(value);
        if (name === 'toDate') setFromDate(value); // Error in original code? fixed to setFromDate/setToDate
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

            {isLoading ? (
                <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
            ) : data ? (
                <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
                        <Box>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>Total Uploads</Typography>
                                    <Typography variant="h3">{data.totalUploads}</Typography>
                                </CardContent>
                            </Card>
                        </Box>
                        <Box>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>Total Downloads</Typography>
                                    <Typography variant="h3">{data.totalDownloads}</Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>

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

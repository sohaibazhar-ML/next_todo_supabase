"use client";
import React, { useState, useEffect } from 'react';
import { Title, useNotify, usePermissions } from 'react-admin';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow,
    CircularProgress,
    Paper,
    Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const ReportsPage = () => {
    const notify = useNotify();
    const { permissions } = usePermissions();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/reports?month=${month}&year=${year}`);
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
    }, [month, year]);

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
        link.setAttribute('download', `report_${year}_${month}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const months = [
        { id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' },
        { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' },
        { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' },
        { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' },
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <Box p={3}>
            <Title title="Monthly Reports" />
            
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" fontWeight="bold">
                    Monthly Interaction Reports
                </Typography>
                
                <Box display="flex" gap={2}>
                    <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
                        <InputLabel>Month</InputLabel>
                        <Select
                            value={month}
                            onChange={(e) => setMonth(e.target.value as number)}
                            label="Month"
                        >
                            {months.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={year}
                            onChange={(e) => setYear(e.target.value as number)}
                            label="Year"
                        >
                            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<DownloadIcon />}
                        onClick={exportToCSV}
                        disabled={!data || loading}
                    >
                        Export CSV
                    </Button>
                </Box>
            </Box>

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

import React from 'react';
import { Title } from 'react-admin';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow,
    CircularProgress,
    Paper,
    Divider
} from '@mui/material';
import { CustomFilterToolbar, FilterDefinition } from '@/admin/molecules';
import { useReportsDashboard } from '@/admin/hooks';
import { DailyReportData } from '@/types';

const filterDefinitions: FilterDefinition[] = [
    { source: 'fromDate', label: 'From Date', type: 'date' },
    { source: 'toDate', label: 'To Date', type: 'date' },
];

/**
 * ReportsPage Organism
 * 
 * Clean, declarative component for administrative reporting.
 * Logic and state are entirely encapsulated in the useReportsDashboard hook.
 */
export const ReportsPage = () => {
    const { 
        data, 
        isLoading, 
        filterState,
        handleFilterChange,
        handleToggleFilter,
        handleExport 
    } = useReportsDashboard();

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
                activeValues={{ 
                    fromDate: filterState.fromDate, 
                    toDate: filterState.toDate 
                }}
                activeFilters={filterState.activeFilters}
                onFilterChange={handleFilterChange}
                onToggleFilter={handleToggleFilter}
                onExport={handleExport}
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
                                {data.dailyData.map((day: DailyReportData) => (
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

import React from 'react';
import { Box, Grid, Card, CardContent, Skeleton, Typography, Divider, Paper } from '@mui/material';

export const StatisticsSkeleton = () => {
    return (
        <Box sx={{ width: '100%', p: 0 }}>
            {/* KPI Cards Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[1, 2, 3, 4].map((i) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '12px' }} />
                                    <Skeleton variant="text" width={40} height={20} />
                                </Box>
                                <Skeleton variant="text" width="60%" height={40} />
                                <Skeleton variant="text" width="40%" height={24} />
                                <Skeleton variant="text" width="30%" height={20} sx={{ mt: 1 }} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                {/* Growth Chart Skeleton */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                                <Box>
                                    <Skeleton variant="text" width={200} height={32} />
                                    <Box display="flex" gap={3} mt={1}>
                                        <Skeleton variant="circular" width={12} height={12} />
                                        <Skeleton variant="text" width={80} />
                                        <Skeleton variant="circular" width={12} height={12} />
                                        <Skeleton variant="text" width={80} />
                                    </Box>
                                </Box>
                                <Skeleton variant="rounded" width={240} height={36} sx={{ borderRadius: '12px' }} />
                            </Box>
                            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: '12px' }} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Downloads Progress Skeleton */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ borderRadius: '24px', height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Skeleton variant="text" width={140} height={32} sx={{ mb: 4 }} />
                            <Box display="flex" flexDirection="column" gap={3.5} mt={4}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Box key={i} display="flex" alignItems="center" gap={2}>
                                        <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '12px' }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                <Skeleton variant="text" width="70%" />
                                                <Skeleton variant="text" width="20%" />
                                            </Box>
                                            <Skeleton variant="rectangular" width="100%" height={6} sx={{ borderRadius: 3 }} />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Downloads by Category Skeleton */}
                <Grid size={{ xs: 12 }}>
                    <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Skeleton variant="text" width={200} height={32} sx={{ mb: 4 }} />
                            <Grid container spacing={4} mt={2}>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Skeleton variant="rectangular" width="100%" height={350} sx={{ borderRadius: '8px' }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                                        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
                                        <Box display="flex" flexDirection="column" gap={2}>
                                            <Skeleton variant="rectangular" width="100%" height={40} />
                                            <Skeleton variant="rectangular" width="100%" height={40} />
                                            <Skeleton variant="rectangular" width="100%" height={40} />
                                            <Skeleton variant="rectangular" width="100%" height={40} />
                                            <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: 2 }} />
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

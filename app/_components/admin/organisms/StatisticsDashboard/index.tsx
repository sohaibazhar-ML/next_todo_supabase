"use client";
import React from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Divider, 
    LinearProgress,
    Paper,
    FormControl,
    Select,
    MenuItem,
    TextField,
    useTheme,
    Tooltip as MuiTooltip
} from '@mui/material';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { StatisticsData } from '@/types';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TodayIcon from '@mui/icons-material/Today';

interface StatisticsDashboardProps {
    statistics: StatisticsData;
    displayMode: 'absolute' | 'percent';
    onApplyFilters?: (filters: { startDate: string, endDate: string, fileType: string }) => void;
}

const COLORS = {
    primary: '#2196F3', // The requested Blue
    secondary: '#90CAF9', // Lighter shade
    faint: '#E3F2FD', // Faintest shade
    charcoal: '#333333',
    trendUp: '#10B981',
    trendDown: '#EF4444',
};

export const StatisticsDashboard = ({ statistics, displayMode, onApplyFilters }: StatisticsDashboardProps) => {
    const theme = useTheme();
    const [isMounted, setIsMounted] = React.useState(false);
    
    // Top-Left Chart Internal Filtering
    const [chartDateFrom, setChartDateFrom] = React.useState('');
    const [chartDateTo, setChartDateTo] = React.useState('');

    // Sidebar Filter Panel Local State
    const [sidebarPeriod, setSidebarPeriod] = React.useState('30');
    const [sidebarDateFrom, setSidebarDateFrom] = React.useState('');
    const [sidebarDateTo, setSidebarDateTo] = React.useState('');
    const [sidebarFileType, setSidebarFileType] = React.useState('all');

    React.useEffect(() => {
        setIsMounted(true);
        // Initialize dates from statistics data
        if (statistics.userGrowthTimeline.length > 0) {
            const firstDate = statistics.userGrowthTimeline[0].date;
            const lastDate = statistics.userGrowthTimeline[statistics.userGrowthTimeline.length - 1].date;
            
            setChartDateFrom(firstDate);
            setChartDateTo(lastDate);
            
            // Sync sidebar initially
            setSidebarDateFrom(firstDate);
            setSidebarDateTo(lastDate);
        }
    }, [statistics.userGrowthTimeline]);

    // Update dates when period changes
    const handlePeriodChange = (days: string) => {
        setSidebarPeriod(days);
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - parseInt(days));
        
        setSidebarDateTo(end.toISOString().split('T')[0]);
        setSidebarDateFrom(start.toISOString().split('T')[0]);
    };

    // Derived filtered timeline with optional percentage transformation
    const filteredTimeline = React.useMemo(() => {
        const baseTimeline = !chartDateFrom && !chartDateTo 
            ? statistics.userGrowthTimeline 
            : statistics.userGrowthTimeline.filter(item => {
                const date = item.date;
                if (chartDateFrom && date < chartDateFrom) return false;
                if (chartDateTo && date > chartDateTo) return false;
                return true;
            });

        if (displayMode === 'absolute' || baseTimeline.length === 0) return baseTimeline;

        // Transform to percentage growth relative to start of window
        const firstValue = baseTimeline[0].users || 1;
        const totalNewInWindow = baseTimeline.reduce((sum, item) => sum + item.count, 0) || 1;

        return baseTimeline.map(item => ({
            ...item,
            users: Number((((item.users - firstValue) / firstValue) * 100).toFixed(1)),
            count: Number(((item.count / totalNewInWindow) * 100).toFixed(1))
        }));
    }, [statistics.userGrowthTimeline, chartDateFrom, chartDateTo, displayMode]);

    // Transformed Downloads by Category — applies file-type filter + percent mode
    const transformedDownloadsByCategory = React.useMemo(() => {
        // Step 1: Apply file-type filter
        let filtered = statistics.downloadsByCategory;
        if (sidebarFileType !== 'all') {
            filtered = filtered.filter(item => item.category.toLowerCase() === sidebarFileType.toLowerCase());
        }

        // Step 2: Apply percent mode transformation
        if (displayMode === 'percent') {
            const total = filtered.reduce((sum, item) => sum + item.count, 0);
            if (total === 0) return filtered;
            return filtered.map(item => ({
                ...item,
                count: Number(((item.count / total) * 100).toFixed(1))
            }));
        }

        return filtered;
    }, [statistics.downloadsByCategory, sidebarFileType, displayMode]);

    // Calculate New Customers (Last 7 Days) from timeline
    const newUsersLast7Days = React.useMemo(() => {
        if (!statistics.userGrowthTimeline || statistics.userGrowthTimeline.length === 0) return 0;
        return statistics.userGrowthTimeline.slice(-7).reduce((acc, curr) => acc + curr.count, 0);
    }, [statistics.userGrowthTimeline]);

    if (!isMounted) {
        return <Box sx={{ height: 800 }} />; // Fixed height placeholder to prevent layout shift
    }


    const kpiCards = [
        {
            title: 'Total Customers',
            value: displayMode === 'absolute' ? statistics.totalUsers.toLocaleString() : `${statistics.userGrowthPercent}%`,
            percent: statistics.userGrowthPercent,
            icon: PeopleIcon,
            subtitle: displayMode === 'absolute' ? 'Registered profiles' : `${statistics.totalUsers.toLocaleString()} total`,
            highlight: false
        },
        {
            title: 'New Customers',
            value: displayMode === 'absolute' ? newUsersLast7Days.toLocaleString() : `${statistics.userGrowthPercent}%`, // Trend for new users
            percent: statistics.userGrowthPercent,
            icon: PeopleIcon,
            subtitle: displayMode === 'absolute' ? 'Last 7 days' : `Window growth`,
            highlight: false
        },
        {
            title: 'Total Downloads',
            value: displayMode === 'absolute' ? statistics.totalDownloads.toLocaleString() : `${statistics.downloadGrowthPercent}%`,
            percent: statistics.downloadGrowthPercent,
            icon: FileDownloadIcon,
            subtitle: displayMode === 'absolute' ? 'Lifetime activity' : `${statistics.totalDownloads.toLocaleString()} total`,
            highlight: false
        },
        {
            title: 'Downloads Today',
            value: displayMode === 'absolute' ? statistics.downloadsToday.toLocaleString() : `${statistics.recentDownloadPercent}%`,
            percent: statistics.recentDownloadPercent,
            icon: TodayIcon,
            subtitle: displayMode === 'absolute' ? 'Last 24 hours' : `${statistics.downloadsToday.toLocaleString()} absolute`,
            highlight: false
        }
    ];

    return (
        <Box>
            {/* KPI Cards Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {kpiCards.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
                        <Card sx={{ 
                            height: '100%', 
                            borderRadius: '16px', 
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            color: 'inherit',
                            cursor: 'pointer',
                            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': { 
                                transform: 'translateY(-8px)',
                                bgcolor: COLORS.primary,
                                color: 'white',
                                borderColor: COLORS.primary,
                                boxShadow: `0 15px 35px ${COLORS.primary}4D`
                            },
                            // Child color overrides on hover
                            '&:hover .icon-box': {
                                bgcolor: 'rgba(255,255,255,0.2) !important',
                                color: 'white !important'
                            },
                            '&:hover .trend-icon, &:hover .trend-value, &:hover .card-title, &:hover .card-subtitle': {
                                color: 'white !important'
                            }
                        }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Box 
                                        className="icon-box"
                                        sx={{ 
                                            p: 1.5, 
                                            borderRadius: '12px', 
                                            bgcolor: COLORS.faint,
                                            color: COLORS.primary,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <card.icon fontSize="medium" />
                                    </Box>
                                    <Box display="flex" alignItems="center">
                                        {card.percent >= 0 ? (
                                            <TrendingUpIcon className="trend-icon" sx={{ color: COLORS.trendUp, fontSize: 16, mr: 0.5, transition: 'color 0.3s' }} />
                                        ) : (
                                            <TrendingDownIcon className="trend-icon" sx={{ color: COLORS.trendDown, fontSize: 16, mr: 0.5, transition: 'color 0.3s' }} />
                                        )}
                                        <Typography 
                                            variant="body2" 
                                            fontWeight="600" 
                                            className="trend-value"
                                            sx={{ color: card.percent >= 0 ? COLORS.trendUp : COLORS.trendDown, transition: 'color 0.3s' }}
                                        >
                                            {Math.abs(card.percent)}%
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {card.value}
                                </Typography>
                                <Typography 
                                    variant="subtitle2" 
                                    className="card-title"
                                    sx={{ color: 'text.secondary', mt: 0.5, transition: 'color 0.3s' }}
                                >
                                    {card.title}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    className="card-subtitle"
                                    sx={{ color: 'text.disabled', display: 'block', mt: 1, transition: 'color 0.3s', opacity: 0.8 }}
                                >
                                    {card.subtitle}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                {/* Growth Chart (Customer Trends) */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                                <Box>
                                    <Typography variant="h6" fontWeight="800">Customer Trends</Typography>
                                    <Box display="flex" gap={3} mt={1}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.primary }} />
                                            <Typography variant="caption" fontWeight="600" color="text.secondary">Customers</Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.secondary }} />
                                            <Typography variant="caption" fontWeight="600" color="text.secondary">New Customers</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* High-Fidelity Date Filter Selector */}
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        px: 2, 
                                        py: 0.75, 
                                        borderRadius: '12px', 
                                        border: '1px solid', 
                                        borderColor: 'divider',
                                        bgcolor: '#fcfcfc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    <Box 
                                        component="input" 
                                        type="date" 
                                        value={chartDateFrom}
                                        onChange={(e) => setChartDateFrom(e.target.value)}
                                        sx={{ 
                                            border: 'none', 
                                            outline: 'none', 
                                            fontSize: '13px', 
                                            fontWeight: '700', 
                                            color: '#444', 
                                            bgcolor: 'transparent',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit'
                                        }} 
                                    />
                                    <Typography variant="caption" sx={{ color: '#ccc', fontWeight: 'bold' }}>—</Typography>
                                    <Box 
                                        component="input" 
                                        type="date" 
                                        value={chartDateTo}
                                        onChange={(e) => setChartDateTo(e.target.value)}
                                        sx={{ 
                                            border: 'none', 
                                            outline: 'none', 
                                            fontSize: '13px', 
                                            fontWeight: '700', 
                                            color: '#444', 
                                            bgcolor: 'transparent',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit'
                                        }} 
                                    />
                                    <TodayIcon sx={{ fontSize: 18, color: '#aaa', cursor: 'default' }} />
                                </Paper>
                            </Box>
                            
                            <Box sx={{ height: 400, width: '100%', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height="100%" key={`growth-chart-${filteredTimeline.length}`}>
                                    <AreaChart data={filteredTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 12, fill: '#999' }}
                                            tickFormatter={(val) => {
                                                const d = new Date(val);
                                                return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                                            }}
                                            interval="preserveStartEnd"
                                            minTickGap={30}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 12, fill: '#999' }}
                                            tickFormatter={(val) => displayMode === 'percent' ? `${val}%` : val}
                                        />
                                        <Tooltip 
                                            formatter={(value: any) => displayMode === 'percent' ? [`${value}%`, ''] : [value, '']}
                                            contentStyle={{ 
                                                borderRadius: '16px', 
                                                border: 'none', 
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                                padding: '16px'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="users" 
                                            name="Total"
                                            stroke={COLORS.primary} 
                                            strokeWidth={4}
                                            fillOpacity={1} 
                                            fill="url(#colorUsers)" 
                                            dot={{ r: 4, fill: COLORS.primary, strokeWidth: 2, stroke: 'white' }}
                                            activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="count" 
                                            name="New"
                                            stroke={COLORS.secondary} 
                                            strokeWidth={2}
                                            fill="none"
                                            strokeDasharray="5 5"
                                            dot={{ r: 3, fill: COLORS.secondary, strokeWidth: 2, stroke: 'white' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Downloads Progress */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ borderRadius: '24px', height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight="800" mb={4}>Top Downloads</Typography>
                            <Box display="flex" flexDirection="column" gap={3.5}>
                                {statistics.topDownloads.map((item, index) => {
                                    const maxCount = statistics.topDownloads[0].count;
                                    const progress = (item.count / maxCount) * 100;
                                    
                                    return (
                                        <Box key={item.id} display="flex" alignItems="center" gap={2}>
                                            <Box 
                                                sx={{ 
                                                    width: 44, 
                                                    height: 44, 
                                                    borderRadius: '12px', 
                                                    bgcolor: '#f5f5f5', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <TodayIcon sx={{ color: '#666', fontSize: 20 }} />
                                            </Box>
                                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                    <Typography variant="body2" fontWeight="700" noWrap>
                                                        {item.title}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="800" sx={{ color: COLORS.primary }}>
                                                        {item.count.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={progress} 
                                                    sx={{ 
                                                        height: 6, 
                                                        borderRadius: 3, 
                                                        bgcolor: '#eee',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: index === 0 ? COLORS.primary : COLORS.secondary,
                                                            borderRadius: 3
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Downloads by Category Chart with Filters */}
                <Grid size={{ xs: 12 }}>
                    <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight="800" mb={4}>Downloads Analysis</Typography>
                            
                            <Grid container spacing={4}>
                                {/* Chart Area */}
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Box sx={{ height: 350, width: '100%', minWidth: 0 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={transformedDownloadsByCategory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis 
                                                    dataKey="category" 
                                                    axisLine={false} 
                                                    tickLine={false}
                                                    tick={{ fontSize: 13, fontWeight: 600, fill: '#666' }}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: '#999' }}
                                                    tickFormatter={(val) => displayMode === 'percent' ? `${val}%` : val}
                                                />
                                                <Tooltip 
                                                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                                    formatter={(value: any) => displayMode === 'percent' ? [`${value}%`, 'Count'] : [value, 'Count']}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                                />
                                                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50}>
                                                    {transformedDownloadsByCategory.map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={index === 0 ? COLORS.primary : COLORS.secondary} 
                                                            fillOpacity={1 - (index * 0.15)}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Grid>

                                {/* Filter Panel Sidebar */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper 
                                        elevation={0} 
                                        sx={{ 
                                            p: 3, 
                                            borderRadius: '16px', 
                                            bgcolor: '#ffffff', 
                                            height: '100%',
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography variant="subtitle2" fontWeight="700" mb={3}>Filter Panel</Typography>
                                        <Box display="flex" flexDirection="column" gap={2}>
                                            <FormControl fullWidth size="small">
                                                <Select 
                                                    value={sidebarPeriod} 
                                                    onChange={(e) => handlePeriodChange(e.target.value as string)}
                                                    displayEmpty
                                                >
                                                    <MenuItem value="30">Last 30 Days</MenuItem>
                                                    <MenuItem value="14">Last 14 Days</MenuItem>
                                                    <MenuItem value="7">Last 7 Days</MenuItem>
                                                </Select>
                                            </FormControl>
                                            
                                            <Box>
                                                <Typography variant="caption" fontWeight="600" color="text.secondary" mb={0.5} display="block">Start Date</Typography>
                                                <TextField 
                                                    type="date" 
                                                    fullWidth 
                                                    size="small" 
                                                    value={sidebarDateFrom}
                                                    onChange={(e) => setSidebarDateFrom(e.target.value)}
                                                />
                                            </Box>
                                            
                                            <Box>
                                                <Typography variant="caption" fontWeight="600" color="text.secondary" mb={0.5} display="block">End Date</Typography>
                                                <TextField 
                                                    type="date" 
                                                    fullWidth 
                                                    size="small" 
                                                    value={sidebarDateTo}
                                                    onChange={(e) => setSidebarDateTo(e.target.value)}
                                                />
                                            </Box>

                                            <Box mb={2}>
                                                <Typography variant="caption" fontWeight="600" color="text.secondary" mb={0.5} display="block">File Type</Typography>
                                                <FormControl fullWidth size="small">
                                                    <Select 
                                                        value={sidebarFileType}
                                                        onChange={(e) => setSidebarFileType(e.target.value as string)}
                                                    >
                                                        <MenuItem value="all">All</MenuItem>
                                                        {statistics.downloadsByCategory.map((item) => (
                                                            <MenuItem key={item.category} value={item.category.toLowerCase()}>
                                                                {item.category.toUpperCase()}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>

                                            <Box 
                                                component="button" 
                                                onClick={() => onApplyFilters?.({ 
                                                    startDate: sidebarDateFrom, 
                                                    endDate: sidebarDateTo, 
                                                    fileType: sidebarFileType 
                                                })}
                                                sx={{ 
                                                    width: '100%', 
                                                    py: 1.5, 
                                                    borderRadius: '8px', 
                                                    border: 'none', 
                                                    bgcolor: COLORS.primary, 
                                                    color: 'white',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    transition: 'opacity 0.2s',
                                                    '&:hover': { opacity: 0.9 }
                                                }}
                                            >
                                                Apply
                                            </Box>
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



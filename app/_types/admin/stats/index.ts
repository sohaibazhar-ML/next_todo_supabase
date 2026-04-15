export interface StatisticsData {
    totalUsers: number;
    totalDocuments: number;
    totalDownloads: number;
    recentDownloads: number; // Last 30 days
    downloadsToday: number;
    
    // Percentage changes (compared to previous 30-day period)
    userGrowthPercent: number;
    documentGrowthPercent: number;
    downloadGrowthPercent: number;
    recentDownloadPercent: number;

    // Timeline data (last 30 days)
    userGrowthTimeline: TimelinePoint[];

    // Distribution data
    downloadsByCategory: CategoryData[];

    // Top performers
    topDownloads: TopDownloadItem[];
}

export interface TimelinePoint {
    date: string; // ISO date
    users: number;
    count: number; // New users on that date
}

export interface CategoryData {
    category: string;
    count: number;
}

export interface TopDownloadItem {
    id: string;
    title: string;
    count: number;
    file_type: string;
}


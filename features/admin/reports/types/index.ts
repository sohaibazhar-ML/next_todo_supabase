export interface DailyReportData {
    date: string;
    uploads: number;
    downloads: number;
}

export interface ReportStats {
    totalUploads: number;
    totalDownloads: number;
    dailyData: DailyReportData[];
}

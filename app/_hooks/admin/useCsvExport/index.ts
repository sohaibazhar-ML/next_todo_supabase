import { useCallback } from 'react';

export function useCsvExport() {
    const exportToCsv = useCallback((data: Record<string, unknown>[], fileName: string) => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const rows = data.map(row => 
            headers.map(header => JSON.stringify(row[header] ?? '')).join(',')
        );
        
        const csvContent = [
            headers.join(','),
            ...rows
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    return { exportToCsv };
}

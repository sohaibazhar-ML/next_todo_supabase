import { useCallback, useState } from 'react';

export function useDocumentDownload() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const download = useCallback(async (url: string, fileName: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Download failed';
            console.error('Download error:', err);
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { download, loading, error };
}

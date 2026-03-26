import { useState, useCallback } from 'react';

export function useFileUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const upload = useCallback(async (url: string, file: File) => {
        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Upload failed');
            }

            setProgress(100);
            return await response.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setUploading(false);
        }
    }, []);

    return { upload, uploading, progress, error };
}

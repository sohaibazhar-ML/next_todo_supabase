import { useState, useCallback } from 'react';

export function useTagInput(initialTags: string[] = []) {
    const [tags, setTags] = useState<string[]>(initialTags);

    const addTag = useCallback((tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags(prev => [...prev, trimmed]);
        }
    }, [tags]);

    const removeTag = useCallback((tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove));
    }, []);

    return { tags, setTags, addTag, removeTag };
}

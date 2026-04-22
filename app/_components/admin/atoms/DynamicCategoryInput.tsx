"use client";

import React, { useState, useEffect } from 'react';
import { SelectInput, AutocompleteInput, useNotify } from 'react-admin';

interface DynamicCategoryInputProps {
    source: string;
    label?: string;
    required?: boolean;
    fullWidth?: boolean;
    helperText?: string;
    [key: string]: any; // Allow for react-admin filter props like alwaysOn
}

export const DynamicCategoryInput: React.FC<DynamicCategoryInputProps> = ({ 
    source, 
    label = "Category", 
    required = false,
    fullWidth = true,
    helperText,
    ...props
}) => {
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const notify = useNotify();

    useEffect(() => {
        fetch('/api/admin/documents/filter-options')
            .then(res => res.json())
            .then(data => {
                if (data.categories && Array.isArray(data.categories)) {
                    setCategories(data.categories.map((cat: string) => ({ 
                        id: cat, 
                        name: cat 
                    })));
                }
            })
            .catch(err => {
                console.error("Failed to load categories", err);
                notify("Failed to load categories", { type: 'warning' });
            })
            .finally(() => setLoading(false));
    }, [notify]);

    return (
        <SelectInput
            source={source}
            label={label}
            choices={categories}
            isLoading={loading}
            required={required}
            fullWidth={fullWidth}
            helperText={helperText}
            {...props}
        />
    );
};

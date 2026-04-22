"use client";

import React, { useState, useEffect } from 'react';
import { SelectInput, useNotify } from 'react-admin';

interface DynamicFileTypeInputProps {
    source: string;
    label?: string;
    required?: boolean;
    fullWidth?: boolean;
    helperText?: string;
    [key: string]: any; // Allow for react-admin filter props like alwaysOn
}

export const DynamicFileTypeInput: React.FC<DynamicFileTypeInputProps> = ({ 
    source, 
    label = "File Type", 
    required = false,
    fullWidth = true,
    helperText,
    ...props
}) => {
    const [fileTypes, setFileTypes] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const notify = useNotify();

    useEffect(() => {
        fetch('/api/admin/documents/filter-options')
            .then(res => res.json())
            .then(data => {
                if (data.fileTypes && Array.isArray(data.fileTypes)) {
                    setFileTypes(data.fileTypes
                        .filter((ft: string | null) => ft != null && ft !== '')
                        .map((ft: string) => ({ 
                            id: ft, 
                            name: ft.charAt(0).toUpperCase() + ft.slice(1) 
                        }))
                    );
                }
            })
            .catch(err => {
                console.error("Failed to load file types", err);
                notify("Failed to load file types", { type: 'warning' });
            })
            .finally(() => setLoading(false));
    }, [notify]);

    return (
        <SelectInput
            source={source}
            label={label}
            choices={fileTypes}
            isLoading={loading}
            required={required}
            fullWidth={fullWidth}
            helperText={helperText}
            {...props}
        />
    );
};

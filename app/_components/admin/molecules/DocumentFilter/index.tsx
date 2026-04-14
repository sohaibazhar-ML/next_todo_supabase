import { Filter, SearchInput, SelectInput, TextInput, DateInput, FilterProps } from "react-admin";
import { useState, useEffect } from "react";
import { DOCUMENT_CATEGORIES } from "@/admin/constants";

export const DocumentFilter = (props: Omit<FilterProps, 'children'>) => {
    const [dynamicTypes, setDynamicTypes] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        fetch('/api/admin/documents/filter-options')
            .then(res => res.json())
            .then(data => {
                if (data.fileTypes && Array.isArray(data.fileTypes)) {
                    // Prettify common extensions mapped to the type filter ID format
                    const nameMap: Record<string, string> = {
                        'pdf': 'PDF',
                        'docx': 'Document (DOCX)',
                        'document': 'Document (DOCX)',
                        'xlsx': 'Spreadsheet (XLSX)',
                        'spreadsheet': 'Spreadsheet (XLSX)',
                        'zip': 'Archive (ZIP)',
                        'archive': 'Archive (ZIP)',
                        'image': 'Image',
                        'other': 'Other'
                    };
                    
                    setDynamicTypes(data.fileTypes.map((type: string) => ({ 
                        id: type, 
                        name: nameMap[type.toLowerCase()] || type.toUpperCase() 
                    })));
                }
            })
            .catch(err => console.error("Failed to load generic filter options", err));
    }, []);

    return (
        <Filter {...props}>
            <SearchInput placeholder="Search Title, Category, Type..." source="q" alwaysOn />
            <SelectInput
                label="Category"
                source="category"
                choices={[...DOCUMENT_CATEGORIES]}
            />
            <SelectInput
                label="Type"
                source="file_type"
                choices={dynamicTypes}
            />
            <TextInput label="Tags" source="tags" helperText="Comma separated" />
            <DateInput label="From Date" source="fromDate" />
            <DateInput label="To Date" source="toDate" />
        </Filter>
    );
};

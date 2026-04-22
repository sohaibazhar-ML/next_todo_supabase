import { SearchInput, SelectInput, DateInput } from "react-admin";
import { useState, useEffect } from "react";
import { DynamicCategoryInput } from "@/admin/atoms";

export const getDocumentFilters = (dynamicTypes: any[]) => [
    <SearchInput key="q" placeholder="Search Title, Category, Type..." source="q" alwaysOn />,
    <DynamicCategoryInput
        key="category"
        label="Category"
        source="category"
        fullWidth={false}
    />,
    <SelectInput
        key="file_type"
        label="Type"
        source="file_type"
        choices={dynamicTypes}
    />,
    <DateInput key="fromDate" label="From Date" source="fromDate" />,
    <DateInput key="toDate" label="To Date" source="toDate" />,
];

export const DocumentFilter = () => {
    const [dynamicTypes, setDynamicTypes] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        fetch('/api/admin/documents/filter-options')
            .then(res => res.json())
            .then(data => {
                if (data.fileTypes && Array.isArray(data.fileTypes)) {
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

    return getDocumentFilters(dynamicTypes);
};

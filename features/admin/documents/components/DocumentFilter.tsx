import React from "react";
import { Filter, SearchInput, SelectInput, TextInput, DateInput } from "react-admin";

export const DocumentFilter = (props: any) => (
    <Filter {...props}>
        <SearchInput placeholder="Search Title, Category, Type..." source="q" alwaysOn />
        <SelectInput
            label="Category"
            source="category"
            choices={[
                { id: 'Personal', name: 'Personal' },
                { id: 'Legal', name: 'Legal' },
                { id: 'Financial', name: 'Financial' },
                { id: 'Medical', name: 'Medical' },
                { id: 'Other', name: 'Other' },
            ]}
        />
        <SelectInput
            label="Type"
            source="fileType"
            choices={[
                { id: 'pdf', name: 'PDF' },
                { id: 'document', name: 'Document (DOCX)' },
                { id: 'spreadsheet', name: 'Spreadsheet (XLSX)' },
                { id: 'image', name: 'Image' },
                { id: 'archive', name: 'Archive (ZIP)' },
                { id: 'other', name: 'Other' },
            ]}
        />
        <TextInput label="Tags" source="tags" helperText="Comma separated" />
        <DateInput label="From Date" source="fromDate" />
        <DateInput label="To Date" source="toDate" />
    </Filter>
);

import React from "react";
import { Create, SimpleForm, TextInput, SelectInput, FileInput, FileField, BooleanInput } from "react-admin";

export const DocumentCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="title" fullWidth />
            <TextInput source="description" multiline fullWidth />
            <SelectInput
                source="category"
                choices={[
                    { id: 'Personal', name: 'Personal' },
                    { id: 'Legal', name: 'Legal' },
                    { id: 'Financial', name: 'Financial' },
                    { id: 'Medical', name: 'Medical' },
                    { id: 'Other', name: 'Other' },
                ]}
                required
            />
            <TextInput source="tags" helperText="Separate tags with commas" fullWidth />
            <FileInput 
                source="file" 
                label="Document File" 
                multiple
                accept={{ 
                    'application/pdf': ['.pdf'], 
                    'application/msword': ['.doc'], 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                    'application/vnd.ms-excel': ['.xls'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/zip': ['.zip'],
                    'application/x-zip-compressed': ['.zip']
                }}
            >
                <FileField source="src" title="title" />
            </FileInput>
            <BooleanInput source="is_featured" label="Featured" />
            <TextInput source="searchable_content" multiline fullWidth label="Searchable Content (for OCR)" />
        </SimpleForm>
    </Create>
);

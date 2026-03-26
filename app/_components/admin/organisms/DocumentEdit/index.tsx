import React from "react";
import { Edit, SimpleForm, TextInput, SelectInput, BooleanInput } from "react-admin";

export const DocumentEdit = () => (
    <Edit>
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
            <TextInput 
                source="tags" 
                helperText="Separate tags with commas" 
                fullWidth 
                format={(tags: string[] | string) => Array.isArray(tags) ? tags.join(', ') : tags}
                parse={(str: string) => str.split(',').map(t => t.trim()).filter(Boolean)}
            />
            <BooleanInput source="is_featured" label="Featured" />
            <TextInput source="version" />
            <TextInput source="searchable_content" multiline fullWidth label="Searchable Content (for OCR)" />
        </SimpleForm>
    </Edit>
);

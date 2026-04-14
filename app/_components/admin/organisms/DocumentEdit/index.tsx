import React from "react";
import { Edit, SimpleForm, TextInput, SelectInput, BooleanInput } from "react-admin";
import { DOCUMENT_CATEGORIES } from "@/admin/constants";

export const DocumentEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="title" fullWidth />
            <TextInput source="description" multiline fullWidth />
            <SelectInput
                source="category"
                choices={[...DOCUMENT_CATEGORIES]}
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
        </SimpleForm>
    </Edit>
);

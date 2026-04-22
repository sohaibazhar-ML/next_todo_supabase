import { Edit, SimpleForm, TextInput, SelectInput, BooleanInput, FileInput, FileField, TopToolbar, ListButton } from "react-admin";
import { DOCUMENT_CATEGORIES } from "@/admin/constants";
import { DynamicCategoryInput } from "@/admin/atoms";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";

const DocumentEditActions = () => (
    <TopToolbar>
        <ListButton label="Back to Documents" />
    </TopToolbar>
);

export const DocumentEdit = () => (
    <Edit actions={<DocumentEditActions />}>
        <SimpleForm>
            <TextInput source="title" fullWidth />
            <TextInput source="description" multiline fullWidth />
            <DynamicCategoryInput source="category" required />
            <TextInput source="recipient" label="Recipient" fullWidth />
            <TextInput 
                source="tags" 
                helperText="Separate tags with commas" 
                fullWidth 
                format={(tags: string[] | string) => Array.isArray(tags) ? tags.join(', ') : tags}
                parse={(str: string) => str.split(',').map(t => t.trim()).filter(Boolean)}
            />
            <BooleanInput source="is_featured" label="Featured" />
            <FileInput 
                source="file" 
                label="Replace File (optional)" 
                accept={{
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                    'application/vnd.ms-excel': ['.xls'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/zip': ['.zip'],
                }}
                placeholder="Drop a file here to replace the current document, or click to select"
            >
                <FileField source="src" title="title" />
            </FileInput>
        </SimpleForm>
    </Edit>
);

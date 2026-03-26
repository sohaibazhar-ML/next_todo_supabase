"use client";
import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    TextInput,
    SelectInput,
    DateInput,
    Filter,
    Edit,
    SimpleForm,
    Show,
    SimpleShowLayout,
    Create,
    FileInput,
    FileField,
    BooleanInput,
    FunctionField,
    SearchInput,
} from "react-admin";

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

const DocumentFilter = (props: any) => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn />
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

export const DocumentList = () => (
    <List filters={<DocumentFilter />}>
        <Datagrid rowClick="show">
            <TextField source="title" />
            <TextField source="category" />
            <TextField source="file_type" label="Type" />
            <NumberField source="file_size" label="Size (Bytes)" />
            <NumberField source="download_count" label="Downloads" />
            <DateField source="created_at" label="Created" showTime />
            <TextField source="is_active" label="Status" />
        </Datagrid>
    </List>
);

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

export const DocumentShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="title" />
            <TextField source="description" />
            <TextField source="category" />
            <FunctionField 
                label="Tags"
                render={(record: any) => Array.isArray(record.tags) ? record.tags.join(', ') : record.tags} 
            />
            <TextField source="file_name" />
            <NumberField source="file_size" />
            <DateField source="created_at" showTime />
            <NumberField source="download_count" />
            <TextField source="version" />
            <TextField source="searchable_content" />
        </SimpleShowLayout>
    </Show>
);

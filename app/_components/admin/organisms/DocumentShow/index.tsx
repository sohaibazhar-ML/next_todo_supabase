import { Show, SimpleShowLayout, TextField, NumberField, DateField, FunctionField } from "react-admin";
import { Document } from "@/types";

export const DocumentShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="title" />
            <TextField source="description" />
            <TextField source="category" />
            <TextField source="recipient" label="Recipient" />
            <FunctionField 
                label="Tags"
                render={(record: Document) => Array.isArray(record.tags) ? record.tags.join(', ') : record.tags} 
            />
            <TextField source="file_name" />
            <FunctionField 
                label="Size (KB)" 
                render={(record: Document) => record.file_size ? `${(record.file_size / 1024).toFixed(1)} KB` : '0 KB'} 
            />
            <DateField source="created_at" showTime />
            <NumberField source="download_count" />
        </SimpleShowLayout>
    </Show>
);

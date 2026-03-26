import { Show, SimpleShowLayout, TextField, NumberField, DateField, FunctionField } from "react-admin";
import { Document } from "@/shared/types";

export const DocumentShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="title" />
            <TextField source="description" />
            <TextField source="category" />
            <FunctionField 
                label="Tags"
                render={(record: Document) => Array.isArray(record.tags) ? record.tags.join(', ') : record.tags} 
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

import React from "react";
import { List, Datagrid, TextField, DateField, NumberField, usePermissions } from "react-admin";
import { DocumentFilter } from "@/features/admin/documents/components/molecules/DocumentFilter";

export const DocumentList = () => {
    const { permissions } = usePermissions();
    return (
        <List filters={<DocumentFilter />}>
            <Datagrid rowClick="show" bulkActionButtons={permissions === 'admin'}>
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
};

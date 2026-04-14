import React from "react";
import { List, Datagrid, TextField, DateField, NumberField, usePermissions, FunctionField, useRecordContext } from "react-admin";
import { DocumentFilter } from "@/admin/molecules";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const CustomFeaturedField = ({ source, label }: { source: string; label?: string }) => {
    const record = useRecordContext();
    if (!record) return null;
    const value = record[source];
    return value ? (
        <CheckIcon sx={{ color: '#4caf50' }} fontSize="small"  />
    ) : (
        <ClearIcon sx={{ color: '#f44336' }} fontSize="small" />
    );
};

export const DocumentList = () => {
    const { permissions } = usePermissions();
    return (
        <List filters={<DocumentFilter />}>
            <Datagrid rowClick="show" bulkActionButtons={permissions === 'admin'}>
                <TextField source="title" />
                <TextField source="file_name" label="File Name" />
                <TextField source="category" />
                <TextField source="file_type" label="Type" />
                <FunctionField label="Size (KB)" render={(record: any) => record.file_size ? `${(record.file_size / 1024).toFixed(1)} KB` : '0 KB'} />
                <NumberField source="download_count" label="Downloads" />
                <DateField source="created_at" label="Created" showTime />
                <CustomFeaturedField source="is_featured" label="Featured" />
            </Datagrid>
        </List>
    );
};

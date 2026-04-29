import React from "react";
import { List, Datagrid, TextField, DateField, SearchInput, Filter, FilterProps, DateInput, usePermissions } from "react-admin";
import { DynamicCategoryInput } from "../../atoms";

const DownloadLogFilter = (props: Omit<FilterProps, 'children'>) => (
    <Filter {...props}>
        <SearchInput placeholder="Search Document, Category, User..." source="q" alwaysOn />
        <DateInput label="From Date" source="fromDate" />
        <DateInput label="To Date" source="toDate" />
        <DynamicCategoryInput 
            label="Category" 
            source="category" 
            apiUrl="/api/admin/download_logs/filter-options" 
        />
    </Filter>
);

export const DownloadLogList = () => {
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';

    return (
        <List filters={<DownloadLogFilter />}>
            <Datagrid bulkActionButtons={isAdmin ? undefined : false}>
                <TextField source="document_title" label="Document" />
                <TextField source="document_category" label="Category" />
                <TextField source="full_name" label="User" />
                <TextField source="email" label="Email" />
                <DateField source="downloaded_at" showTime label="Downloaded At" />
                <TextField source="ip_address" label="IP Address" />
            </Datagrid>
        </List>
    );
};


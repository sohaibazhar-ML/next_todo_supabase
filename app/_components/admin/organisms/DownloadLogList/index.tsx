import React from "react";
import { List, Datagrid, TextField, DateField, SearchInput, Filter, FilterProps, DateInput, SelectInput, usePermissions, DeleteButton } from "react-admin";
import { DOCUMENT_CATEGORIES } from "@/admin/constants";

const DownloadLogFilter = (props: Omit<FilterProps, 'children'>) => (
    <Filter {...props}>
        <SearchInput placeholder="Search Document, Category, User..." source="q" alwaysOn />
        <DateInput label="From Date" source="fromDate" />
        <DateInput label="To Date" source="toDate" />
        <SelectInput label="Category" source="category" choices={[...DOCUMENT_CATEGORIES]} />
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


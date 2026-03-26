import React from "react";
import { List, Datagrid, TextField, DateField, SearchInput, Filter } from "react-admin";

const DownloadLogFilter = (props: any) => (
    <Filter {...props}>
        <SearchInput placeholder="Search Document, User, IP..." source="q" alwaysOn />
    </Filter>
);

export const DownloadLogList = () => (
    <List filters={<DownloadLogFilter />}>
        <Datagrid bulkActionButtons={false}>
            <TextField source="document_title" label="Document" />
            <TextField source="username" label="User" />
            <TextField source="email" label="Email" />
            <DateField source="downloaded_at" showTime label="Downloaded At" />
            <TextField source="ip_address" label="IP Address" />
        </Datagrid>
    </List>
);

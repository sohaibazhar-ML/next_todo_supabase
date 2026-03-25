"use client";
import {
    List,
    Datagrid,
    TextField,
    DateField,
    ReferenceField,
    TextInput,
    DateInput,
    Filter,
} from "react-admin";

const DownloadLogFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Search IP/User Agent" source="q" alwaysOn />
        <DateInput label="From Date" source="fromDate" />
        <DateInput label="To Date" source="toDate" />
    </Filter>
);

export const DownloadLogList = () => (
    <List filters={<DownloadLogFilter />} sort={{ field: 'downloaded_at', order: 'DESC' }}>
        <Datagrid bulkActionButtons={false}>
            <TextField source="id" />
            <ReferenceField source="document_id" reference="documents" label="Document">
                <TextField source="title" />
            </ReferenceField>
            <ReferenceField source="user_id" reference="profiles" label="User">
                <TextField source="username" />
            </ReferenceField>
            <DateField source="downloaded_at" showTime />
            <TextField source="ip_address" label="IP address" />
            <TextField source="user_agent" label="User agent" />
        </Datagrid>
    </List>
);

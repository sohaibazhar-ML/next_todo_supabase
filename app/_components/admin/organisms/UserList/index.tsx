import React from "react";
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    usePermissions,
} from "react-admin";
import { UserFilter } from "@/admin/molecules";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { useRecordContext } from 'react-admin';
import CountryField from "../../atoms/CountryField";

const CustomBooleanField = ({ source }: { source: string; label?: string }) => {
    const record = useRecordContext();
    if (!record) return null;
    const value = record[source];
    return value ? (
        <CheckIcon sx={{ color: '#4caf50' }} fontSize="small"  />
    ) : (
        <ClearIcon sx={{ color: '#f44336' }} fontSize="small" />
    );
};

export const UserList = () => {
    const { permissions } = usePermissions();
    return (
        <List filters={<UserFilter />}>
            <Datagrid rowClick="edit" bulkActionButtons={permissions === 'admin'}>
                <TextField source="first_name" />
                <TextField source="last_name" />
                <EmailField source="email" />
                <CustomBooleanField source="email_confirmed" label="Confirmed" />
                <CustomBooleanField source="has_pets" label="Has Pets" />
                <CountryField source="country_of_origin" label="Country" />
                <TextField source="role" />
                <DateField source="created_at" label="Joined" />
            </Datagrid>
        </List>
    );
};

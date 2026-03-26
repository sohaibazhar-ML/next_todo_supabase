import React from "react";
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    usePermissions,
} from "react-admin";
import { UserFilter } from "@/features/admin/users/components/UserFilter";

export const UserList = () => {
    const { permissions } = usePermissions();
    return (
        <List filters={<UserFilter />}>
            <Datagrid rowClick="show" bulkActionButtons={permissions === 'admin'}>
                <TextField source="username" />
                <TextField source="first_name" />
                <TextField source="last_name" />
                <EmailField source="email" />
                <TextField source="role" />
                <DateField source="created_at" label="Joined" />
            </Datagrid>
        </List>
    );
};

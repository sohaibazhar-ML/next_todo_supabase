import React from "react";
import { Edit, SimpleForm, TextInput, SelectInput } from "react-admin";

export const UserEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="first_name" />
            <TextInput source="last_name" />
            <TextInput source="email" />
            <SelectInput
                source="role"
                choices={[
                    { id: 'user', name: 'User' },
                    { id: 'subadmin', name: 'Subadmin' },
                    { id: 'admin', name: 'Admin' },
                ]}
            />
        </SimpleForm>
    </Edit>
);

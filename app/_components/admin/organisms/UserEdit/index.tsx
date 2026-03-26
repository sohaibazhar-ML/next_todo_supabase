import React from "react";
import { Edit, SimpleForm, TextInput, SelectInput } from "react-admin";
import { ADMIN_ROLES } from "@/admin/constants";

export const UserEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="first_name" />
            <TextInput source="last_name" />
            <TextInput source="email" />
            <SelectInput
                source="role"
                choices={[...ADMIN_ROLES]}
            />
        </SimpleForm>
    </Edit>
);

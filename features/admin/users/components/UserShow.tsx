import React from "react";
import { Show, SimpleShowLayout, TextField, EmailField, DateField } from "react-admin";

export const UserShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="username" />
            <TextField source="first_name" />
            <TextField source="last_name" />
            <EmailField source="email" />
            <TextField source="role" />
            <TextField source="country_of_origin" />
            <DateField source="created_at" showTime />
        </SimpleShowLayout>
    </Show>
);

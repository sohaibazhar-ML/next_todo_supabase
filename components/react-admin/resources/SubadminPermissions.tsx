"use client";
import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    ReferenceField,
    Edit,
    SimpleForm,
    BooleanInput,
    ReferenceInput,
    SelectInput,
    Create,
    TextInput,
    required,
} from "react-admin";

export const SubadminPermissionList = () => (
    <List>
        <Datagrid rowClick="edit">
            <ReferenceField source="user_id" reference="profiles" label="User">
                <TextField source="username" />
            </ReferenceField>
            <BooleanField source="can_upload_documents" label="Upload Docs" />
            <BooleanField source="can_view_stats" label="View Stats" />
            <BooleanField source="is_active" label="Active" />
            <TextField source="updated_at" label="Last Updated" />
        </Datagrid>
    </List>
);

export const SubadminPermissionEdit = () => (
    <Edit>
        <SimpleForm>
            <ReferenceField source="user_id" reference="profiles" label="User">
                <TextField source="username" />
            </ReferenceField>
            <BooleanInput source="can_upload_documents" />
            <BooleanInput source="can_view_stats" />
            <BooleanInput source="is_active" />
        </SimpleForm>
    </Edit>
);

export const SubadminPermissionCreate = () => (
    <Create>
        <SimpleForm>
            <ReferenceInput source="user_id" reference="profiles" label="User">
                <SelectInput optionText="username" validate={required()} />
            </ReferenceInput>
            <BooleanInput source="can_upload_documents" />
            <BooleanInput source="can_view_stats" />
            <BooleanInput source="is_active" defaultValue={true} />
        </SimpleForm>
    </Create>
);

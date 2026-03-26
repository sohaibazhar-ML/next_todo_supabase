"use client";
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    TextInput,
    SelectInput,
    DateInput,
    Filter,
    Edit,
    SimpleForm,
    Show,
    SimpleShowLayout,
    SearchInput,
    usePermissions,
} from "react-admin";

const UserFilter = (props: any) => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn />
        <SelectInput
            label="Role"
            source="role"
            choices={[
                { id: 'all', name: 'All' },
                { id: 'user', name: 'User' },
                { id: 'subadmin', name: 'Subadmin' },
                { id: 'admin', name: 'Admin' },
            ]}
        />
        <DateInput label="From Date" source="fromDate" />
        <DateInput label="To Date" source="toDate" />
    </Filter>
);

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

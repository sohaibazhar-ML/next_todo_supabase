import { Filter, SearchInput, SelectInput, DateInput, FilterProps } from "react-admin";

export const UserFilter = (props: Omit<FilterProps, 'children'>) => (
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

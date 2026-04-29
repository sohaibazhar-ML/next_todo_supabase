import { Filter, SearchInput, SelectInput, DateInput, FilterProps } from "react-admin";
import { Box } from "@mui/material";
import { COUNTRIES } from "../../constants/countries";
import Image from "next/image";

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
        <SelectInput
            label="Country"
            source="country_of_origin"
            choices={COUNTRIES}
            optionValue="value"
            emptyText="All"
            optionText={choice => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Image src={choice.flag} alt={choice.label} width={20} height={14} />
                    <span>{choice.label}</span>
                </Box>
            )}
        />
        <DateInput label="From Date" source="fromDate" />
        <DateInput label="To Date" source="toDate" />
    </Filter>
);

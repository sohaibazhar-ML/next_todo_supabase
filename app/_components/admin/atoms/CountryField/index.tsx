import React from "react";
import { useRecordContext } from "react-admin";
import { Box, Typography } from "@mui/material";
import { COUNTRIES } from "../../constants/countries";

interface CountryFieldProps {
    source: string;
    label?: string;
}

const CountryField = ({ source }: CountryFieldProps) => {
    const record = useRecordContext();
    if (!record || !record[source]) return null;

    const countryCode = record[source];
    const country = COUNTRIES.find(c => c.value === countryCode);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
                component="img"
                src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
                alt={countryCode}
                sx={{ width: 24, height: 'auto', borderRadius: '2px', border: '1px solid', borderColor: 'grey.300' }}
            />
            <Typography variant="body2">
                {country ? country.label : countryCode}
            </Typography>
        </Box>
    );
};

export default CountryField;

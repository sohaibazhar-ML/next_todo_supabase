import { AppBar } from 'react-admin';
import { Typography } from '@mui/material';

export const MyAppBar = (props: any) => (
    <AppBar 
        {...props} 
        sx={{ 
            bgcolor: '#CD1C18 !important',
            color: 'white !important',
            '& .MuiTypography-root': {
                color: 'white !important',
            },
            '& .MuiIconButton-root': {
                color: 'white !important',
            }
        }}
    >
        <Typography
            variant="h6"
            color="inherit"
            sx={{
                flex: 1,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                fontWeight: 700,
            }}
            id="react-admin-title"
        />
    </AppBar>
);

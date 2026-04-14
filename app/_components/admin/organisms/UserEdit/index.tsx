import { 
    Edit, 
    SimpleForm, 
    TextInput, 
    SelectInput, 
    BooleanInput, 
    DateInput,
    ReferenceManyField,
    Datagrid,
    TextField,
    DateField,
    FunctionField,
    NumberInput,
    Toolbar,
    SaveButton,
    DeleteButton,
    useGetIdentity,
    useRecordContext,
    ReferenceManyCount
} from "react-admin";
import { Grid, Card, CardContent, Typography, Box, Divider } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import PetsIcon from "@mui/icons-material/Pets";
import { ADMIN_ROLES } from "@/admin/constants";
import { COUNTRIES } from "../../constants/countries";

const UserEditToolbar = () => {
    const record = useRecordContext();
    const { data: identity } = useGetIdentity();
    
    // Hide delete button if editing self
    const isEditingSelf = identity && record && identity.id === record.id;
    
    return (
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'transparent', px: 0 }}>
            <SaveButton label="Save Changes" />
            {!isEditingSelf && (
                <DeleteButton 
                    mutationMode="pessimistic" 
                    confirmTitle="Delete User Profile?"
                    confirmContent="Are you sure you want to delete this user? This action cannot be undone."
                />
            )}
        </Toolbar>
    );
};

export const UserEdit = () => (
    <Edit mutationMode="pessimistic" sx={{ '& .RaEdit-main': { width: '100%' } }}>
        <SimpleForm toolbar={<UserEditToolbar />} sx={{ '& .MuiCardContent-root': { p: 3 } }}>
            <Grid container spacing={4}>
                {/* Column 1: Core User Details */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonIcon color="primary" />
                            <Typography variant="h6">Edit Identity</Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <TextInput source="first_name" label="First Name" fullWidth validate={[]} />
                            </Grid>
                            <Grid size={6}>
                                <TextInput source="last_name" label="Last Name" fullWidth validate={[]} />
                            </Grid>
                        </Grid>
                        
                        <TextInput source="email" label="Email Address" fullWidth disabled />
                        
                        <Box sx={{ display: 'flex', gap: 4, my: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <BooleanInput source="email_confirmed" label="Confirmed" />
                            <BooleanInput source="marketing_consent" label="Marketing Consent" />
                        </Box>

                        <Divider />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HomeIcon color="action" fontSize="small" />
                            <Typography variant="subtitle2" color="text.secondary">Contact & Address</Typography>
                        </Box>

                        <TextInput source="current_address" label="Current Address" fullWidth multiline />
                        <TextInput source="new_address_switzerland" label="Address (Switzerland)" fullWidth multiline />
                        
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <SelectInput 
                                    source="country_of_origin" 
                                    label="Country" 
                                    fullWidth 
                                    choices={COUNTRIES}
                                    optionValue="value"
                                    optionText={choice => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <img src={choice.flag} alt={choice.label} style={{ width: 20 }} />
                                            <span>{choice.label}</span>
                                        </Box>
                                    )}
                                />
                            </Grid>
                            <Grid size={6}>
                                <TextInput source="phone_number" label="Phone" fullWidth />
                            </Grid>
                        </Grid>

                        <Divider />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PetsIcon color="action" fontSize="small" />
                            <Typography variant="subtitle2" color="text.secondary">Household Info</Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={4}>
                                <BooleanInput source="has_pets" label="Has Pets" />
                            </Grid>
                            <Grid size={8}>
                                <TextInput source="pets_type" label="Pet Details" fullWidth />
                            </Grid>
                        </Grid>
                        
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <NumberInput source="number_of_adults" label="Adults" fullWidth />
                            </Grid>
                            <Grid size={6}>
                                <NumberInput source="number_of_children" label="Children" fullWidth />
                            </Grid>
                        </Grid>

                        <Divider />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <SelectInput
                                source="role"
                                label="User Role"
                                choices={[...ADMIN_ROLES]}
                                fullWidth
                            />
                            <BooleanInput source="keep_me_logged_in" label="Remember Me (Auto-login)" />
                        </Box>
                    </Box>
                </Grid>

                {/* Column 2: Admin Notes & Settings */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2 }}>Admin Notes</Typography>
                            <TextInput 
                                source="admin_notes" 
                                label="Include any internal notes about this user..." 
                                multiline 
                                fullWidth 
                                rows={20}
                                sx={{ 
                                    '& .MuiInputBase-root': { 
                                        minHeight: '480px',
                                        alignItems: 'flex-start',
                                        bgcolor: 'white'
                                    } 
                                }}
                            />
                        </Box>
                        
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: 'primary.50', 
                            borderRadius: 1, 
                            border: '1px dashed', 
                            borderColor: 'primary.300',
                            textAlign: 'center'
                        }}>
                            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                SYSTEM ADVISORY
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Changes to User Roles take effect after the next login session.
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            
            {/* Custom Bottom Actions */}
            <Box sx={{ 
                mt: 4, 
                pt: 3, 
                borderTop: '1px solid', 
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <Box>
                    <Typography variant="caption" color="text.disabled">
                        Record ID: 
                        <TextField source="id" sx={{ ml: 1 }} />
                    </Typography>
                </Box>
            </Box>
        </SimpleForm>
    </Edit>
);

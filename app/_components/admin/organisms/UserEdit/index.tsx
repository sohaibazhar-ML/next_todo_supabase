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
    ReferenceManyCount,
    TopToolbar,
    ListButton
} from "react-admin";
import { Grid, Card, CardContent, Typography, Box, Divider } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import PetsIcon from "@mui/icons-material/Pets";
import { ADMIN_ROLES } from "@/admin/constants";
import { COUNTRIES } from "../../constants/countries";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import Image from "next/image";

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

const UserEditActions = () => (
    <TopToolbar>
        <ListButton label="Back to Users" />
    </TopToolbar>
);

export const UserEdit = () => (
    <Edit 
        actions={<UserEditActions />}
        mutationMode="pessimistic" 
        sx={{ '& .RaEdit-main': { width: '100%' } }}
    >
        <SimpleForm toolbar={<UserEditToolbar />} sx={{ '& .MuiCardContent-root': { p: 3 } }}>
            <Grid container spacing={4}>
                {/* Column 1: Core User Details */}
                <Grid size={{ xs: 12, md: 4 }}>
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
                                            <Image src={choice.flag} alt={choice.label} width={20} height={14} />
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
                <Grid size={{ xs: 12, md: 5 }}>
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

                {/* Column 3: History Sidebar (Migrated from Show page) */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ position: 'sticky', top: 20 }}>
                        <Card variant="outlined" sx={{ mb: 3, bgcolor: 'white', borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <HistoryIcon fontSize="small" color="primary" /> Interaction History
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Total Downloads:</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            <ReferenceManyCount
                                                reference="download_logs"
                                                target="user_id"
                                                source="id"
                                            />
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Member Since:</Typography>
                                        <DateField source="created_at" locales="de-CH" />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Account Updated:</Typography>
                                        <DateField source="updated_at" locales="de-CH" />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 1, fontWeight: 'bold' }}>
                            <FileDownloadIcon fontSize="small" color="action" /> Recent Activity Logs
                        </Typography>

                        <Card variant="outlined" sx={{ bgcolor: 'grey.50', maxHeight: '500px', overflowY: 'auto' }}>
                            <ReferenceManyField
                                reference="download_logs"
                                target="user_id"
                                source="id"
                                sort={{ field: 'downloaded_at', order: 'DESC' }}
                                pagination={false}
                            >
                                <Datagrid bulkActionButtons={false} sx={{
                                    '& .MuiTableCell-root': { py: 1.5, px: 2 },
                                    '& .MuiTableHead-root': { display: 'none' }
                                }}>
                                    <FunctionField
                                        source="id"
                                        render={record => (
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, display: 'block', color: 'text.primary' }}>
                                                    {record.document_title || "Document Downloaded"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(record.downloaded_at).toLocaleString('de-CH', {
                                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </Typography>
                                            </Box>
                                        )}
                                    />
                                </Datagrid>
                            </ReferenceManyField>
                        </Card>

                        <Box sx={{ mt: 2, px: 1 }}>
                            <Typography variant="caption" color="text.disabled">
                                Record ID:
                                <TextField source="id" sx={{ ml: 1 }} />
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </SimpleForm>
    </Edit>
);

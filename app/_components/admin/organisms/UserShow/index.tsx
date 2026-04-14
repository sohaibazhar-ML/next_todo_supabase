import React from "react";
import {
    Show,
    SimpleShowLayout,
    TextField,
    EmailField,
    DateField,
    BooleanField,
    ReferenceManyField,
    Datagrid,
    FunctionField,
    ReferenceManyCount
} from "react-admin";
import { Grid, Card, CardContent, Typography, Box, Divider } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import PetsIcon from "@mui/icons-material/Pets";

import CountryField from "../../atoms/CountryField";

export const UserShow = () => (
    <Show sx={{ '& .RaShow-main': { width: '100%' } }}>
        <SimpleShowLayout sx={{ '& .MuiCardContent-root': { p: 3 } }}>
            <Grid container spacing={4}>
                {/* Column 1: Core User Details */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonIcon color="primary" />
                            <Typography variant="h6">Identity & Profile</Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">First Name</Typography>
                                    <TextField source="first_name" sx={{ fontWeight: 500 }} />
                                </Box>
                            </Grid>
                            <Grid size={6}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Last Name</Typography>
                                    <TextField source="last_name" sx={{ fontWeight: 500 }} />
                                </Box>
                            </Grid>
                        </Grid>

                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Email Address</Typography>
                            <EmailField source="email" />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 6, py: 1, px: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Confirmed</Typography>
                                <BooleanField source="email_confirmed" />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Marketing Consent</Typography>
                                <BooleanField source="marketing_consent" />
                            </Box>
                        </Box>

                        <Divider />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HomeIcon color="action" fontSize="small" />
                            <Typography variant="subtitle2" color="text.secondary">Address Information</Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Current Address</Typography>
                            <TextField source="current_address" />
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Address (Switzerland)</Typography>
                            <TextField source="new_address_switzerland" />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Country</Typography>
                                    <CountryField source="country_of_origin" />
                                </Box>
                            </Grid>
                            <Grid size={6}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Phone Number</Typography>
                                    <TextField source="phone_number" />
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PetsIcon color="action" fontSize="small" />
                            <Typography variant="subtitle2" color="text.secondary">Household & Pets</Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Has Pets</Typography>
                                    <BooleanField source="has_pets" />
                                </Box>
                            </Grid>
                            <Grid size={6}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Pet Details</Typography>
                                    <TextField source="pets_type" emptyText="None" />
                                </Box>
                            </Grid>
                        </Grid>

                        <Box>
                            <Grid container spacing={2}>
                                <Grid size={6}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Adults</Typography>
                                        <TextField source="number_of_adults" />
                                    </Box>
                                </Grid>
                                <Grid size={6}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Children</Typography>
                                        <TextField source="number_of_children" />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>System Status</Typography>
                            <Box sx={{ display: 'flex', gap: 6, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Box>
                                    <Typography variant="caption" color="text.disabled" display="block">Role</Typography>
                                    <TextField source="role" sx={{ fontWeight: 'bold', textTransform: 'uppercase', mt: 0.5, display: 'block' }} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.disabled" display="block">Keep Me Logged In</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <BooleanField source="keep_me_logged_in" />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                {/* Column 2: Admin Notes */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
                        <Card variant="outlined" sx={{ bgcolor: 'grey.50', minHeight: '500px', p: 3, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Admin Notes</Typography>
                            <Box sx={{ flexGrow: 1, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'grey.200 shadow-sm' }}>
                                <TextField
                                    source="admin_notes"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        fontStyle: 'italic',
                                        color: 'text.secondary',
                                        width: '100%'
                                    }}
                                    emptyText="No administrative notes available for this user."
                                />
                            </Box>
                        </Card>
                    </Box>
                </Grid>

                {/* Column 3: History Sidebar */}
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
                    </Box>
                </Grid>
            </Grid>
        </SimpleShowLayout>
    </Show>
);

import { Title } from 'react-admin';
import { Box, Typography, CircularProgress, Alert, Paper, Divider, Button } from '@mui/material';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import { UserProfile } from '@/types';

export const SettingsPage = () => {
    const { data: profile, isLoading, error } = useAdminProfile();

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return <Box p={2}><Alert severity="error">Error: {errorMessage}</Alert></Box>;
    }

    return (
        <Box p={3}>
            <Title title="Settings" />
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Settings
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Manage your account profile and system preferences
                </Typography>
            </Box>
            
            <Paper elevation={2} sx={{ p: 4, maxWidth: 800 }}>
                <Typography variant="h6" gutterBottom>
                    Profile Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {profile && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Username</Typography>
                                <Typography variant="body1">{profile.username}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                                <Typography variant="body1">{profile.email}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">First Name</Typography>
                                <Typography variant="body1">{profile.first_name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Last Name</Typography>
                                <Typography variant="body1">{profile.last_name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Role</Typography>
                                <Typography variant="body1">{profile.role}</Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Paper>

            {profile?.role === 'admin' && (
                <Paper elevation={2} sx={{ p: 4, mt: 4, maxWidth: 800, borderLeft: '4px solid #1976d2' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Administrative Actions
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="body2" color="textSecondary" mb={3}>
                        As an administrator, you can manage system-wide settings and user permissions.
                    </Typography>
                    <Box display="flex" gap={2}>
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            href="#/profiles"
                        >
                            Manage Users & Roles
                        </Button>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};



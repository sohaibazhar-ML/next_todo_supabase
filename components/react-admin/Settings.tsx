import React, { useEffect, useState } from 'react';
import { Title } from 'react-admin';
import { Box, Typography, CircularProgress, Alert, Paper, Divider, Button } from '@mui/material';
import { createClient } from '@/lib/supabase/client';

const SettingsPage = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                const response = await fetch(`/api/profiles?userId=${user.id}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to fetch profile');
                
                // If data is an array (Standard API might return list), get first item
                const userProfile = Array.isArray(data) ? data[0] : data;
                setProfile(userProfile);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Box p={2}><Alert severity="error">Error: {error}</Alert></Box>;
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

export default SettingsPage;

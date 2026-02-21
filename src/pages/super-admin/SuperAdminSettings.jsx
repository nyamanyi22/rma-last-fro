import React from 'react';
import { Paper, Typography, Box, Switch, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from '@mui/material';

const SuperAdminSettings = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                System Settings
            </Typography>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <List>
                    <ListItem sx={{ p: 3 }}>
                        <ListItemText
                            primary="Email Notifications"
                            secondary="Enable or disable system-wide email notifications"
                            primaryTypographyProps={{ fontWeight: 600 }}
                        />
                        <ListItemSecondaryAction>
                            <Switch defaultChecked />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ p: 3 }}>
                        <ListItemText
                            primary="Maintenance Mode"
                            secondary="Prevent users from accessing the system"
                            primaryTypographyProps={{ fontWeight: 600 }}
                        />
                        <ListItemSecondaryAction>
                            <Switch />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ p: 3 }}>
                        <ListItemText
                            primary="Allow New Registrations"
                            secondary="Allow new users to create accounts"
                            primaryTypographyProps={{ fontWeight: 600 }}
                        />
                        <ListItemSecondaryAction>
                            <Switch defaultChecked />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
};

export default SuperAdminSettings;

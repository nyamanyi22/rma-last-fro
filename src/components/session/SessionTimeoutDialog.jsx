import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';

const SessionTimeoutDialog = () => {
  const { warningOpen, refreshing, refreshSession } = useSessionTimeout();

  return (
    <Dialog open={warningOpen} maxWidth="xs" fullWidth>
      <DialogTitle>Session Timeout Warning</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your session will expire in 5 minutes. Click OK to stay logged in.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          onClick={refreshSession}
          disabled={refreshing}
        >
          {refreshing ? <CircularProgress size={20} color="inherit" /> : 'OK'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutDialog;

import { useCallback, useEffect, useRef, useState } from 'react';
import authService from '../services/api/authService';
import { usePortalSettings } from '../context/PortalSettingsContext';

const WARNING_WINDOW_MS = 5 * 60 * 1000;

export const useSessionTimeout = () => {
  const {
    sessionTimeoutAlerts,
    sessionDurationHours,
    loading: settingsLoading,
  } = usePortalSettings();
  const [warningOpen, setWarningOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const timeoutRef = useRef(null);
  const expiryRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const getStoredExpiry = useCallback(() => {
    const expiresAt = localStorage.getItem('session_expires_at');
    return expiresAt ? new Date(expiresAt).getTime() : null;
  }, []);

  const scheduleWarning = useCallback(() => {
    clearTimer();

    const token = authService.getToken();
    const user = authService.getUserFromStorage();

    if (!token || !user || settingsLoading || !sessionTimeoutAlerts) {
      setWarningOpen(false);
      return;
    }

    const expiresAt = getStoredExpiry();
    if (!expiresAt) {
      return;
    }

    expiryRef.current = expiresAt;
    const warningAt = expiresAt - WARNING_WINDOW_MS;
    const delay = warningAt - Date.now();

    if (expiresAt <= Date.now()) {
      authService.clearSession();
      window.location.href = '/login?session=expired';
      return;
    }

    if (delay <= 0) {
      setWarningOpen(true);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      setWarningOpen(true);
    }, delay);
  }, [clearTimer, getStoredExpiry, sessionTimeoutAlerts, settingsLoading]);

  const refreshSession = useCallback(async () => {
    setRefreshing(true);
    try {
      await authService.refreshSession();
      setWarningOpen(false);
      scheduleWarning();
    } catch (error) {
      authService.clearSession();
      window.location.href = '/login?session=expired';
    } finally {
      setRefreshing(false);
    }
  }, [scheduleWarning]);

  useEffect(() => {
    scheduleWarning();

    const onStorage = () => {
      scheduleWarning();
    };

    window.addEventListener('storage', onStorage);

    return () => {
      clearTimer();
      window.removeEventListener('storage', onStorage);
    };
  }, [clearTimer, scheduleWarning]);

  return {
    warningOpen,
    refreshing,
    closeWarning: () => setWarningOpen(false),
    refreshSession,
    sessionDurationHours,
  };
};

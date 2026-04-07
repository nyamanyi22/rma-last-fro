import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { portalApi } from '../services/api/api';

const DEFAULT_PORTAL_NAME = 'RMA System';

const PortalSettingsContext = createContext({
  portalName: DEFAULT_PORTAL_NAME,
  supportEmail: '',
  disableAllNotifications: false,
  rmaEmailAlertsToStaff: true,
  sessionTimeoutAlerts: true,
  sessionDurationHours: 8,
  loading: true,
  refreshPortalSettings: async () => {},
});

export const PortalSettingsProvider = ({ children }) => {
  const [portalName, setPortalName] = useState(DEFAULT_PORTAL_NAME);
  const [supportEmail, setSupportEmail] = useState('');
  const [disableAllNotifications, setDisableAllNotifications] = useState(false);
  const [rmaEmailAlertsToStaff, setRmaEmailAlertsToStaff] = useState(true);
  const [sessionTimeoutAlerts, setSessionTimeoutAlerts] = useState(true);
  const [sessionDurationHours, setSessionDurationHours] = useState(8);
  const [loading, setLoading] = useState(true);

  const refreshPortalSettings = async () => {
    try {
      const response = await portalApi.getPortalSettings();
      if (response.data?.success) {
        setPortalName(response.data.data?.portal_name || DEFAULT_PORTAL_NAME);
        setSupportEmail(response.data.data?.support_email || '');
        setDisableAllNotifications(response.data.data?.disable_all_notifications ?? false);
        setRmaEmailAlertsToStaff(response.data.data?.rma_email_alerts_to_staff ?? true);
        setSessionTimeoutAlerts(response.data.data?.session_timeout_alerts ?? true);
        setSessionDurationHours(response.data.data?.session_duration_hours || 8);
      }
    } catch (error) {
      console.error('Failed to load portal settings', error);
      setPortalName(DEFAULT_PORTAL_NAME);
      setDisableAllNotifications(false);
      setRmaEmailAlertsToStaff(true);
      setSessionTimeoutAlerts(true);
      setSessionDurationHours(8);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPortalSettings();
  }, []);

  const value = useMemo(() => ({
    portalName,
    supportEmail,
    disableAllNotifications,
    rmaEmailAlertsToStaff,
    sessionTimeoutAlerts,
    sessionDurationHours,
    loading,
    refreshPortalSettings,
  }), [portalName, supportEmail, disableAllNotifications, rmaEmailAlertsToStaff, sessionTimeoutAlerts, sessionDurationHours, loading]);

  return (
    <PortalSettingsContext.Provider value={value}>
      {children}
    </PortalSettingsContext.Provider>
  );
};

export const usePortalSettings = () => useContext(PortalSettingsContext);

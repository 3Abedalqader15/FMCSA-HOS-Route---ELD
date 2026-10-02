import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import OverviewPage from './pages/OverviewPage';
import TripPlannerPage from './pages/TripPlannerPage';
import EldLogsPage from './pages/EldLogsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import { checkApiHealth } from './services/api';

export default function App() {
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [tripResult, setTripResult] = useState(null);

  useEffect(() => {
    async function verifyHealth() {
      const health = await checkApiHealth();
      setIsBackendOnline(!!health);
    }
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Routes>
      <Route element={<AppLayout isBackendOnline={isBackendOnline} />}>
        <Route index element={<OverviewPage />} />
        <Route path="planner" element={
          <TripPlannerPage tripResult={tripResult} setTripResult={setTripResult} />
        } />
        <Route path="logs" element={<EldLogsPage tripResult={tripResult} />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
    </Routes>
  );
}

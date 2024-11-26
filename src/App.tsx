import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import CallbackPage from './pages/CallbackPage';
import DashboardPage from './pages/DashboardPage';
import ScheduledPinsPage from './pages/ScheduledPinsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 5000,
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
            duration: 6000,
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/scheduled" element={<ScheduledPinsPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
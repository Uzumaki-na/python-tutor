import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PreferencesProvider } from './contexts/PreferencesContext';
import Layout from './components/Layout';
import Learn from './pages/Learn';
import Dashboard from './pages/Dashboard';
import Revision from './pages/Revision';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Home from './pages/Home';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Learn />} />
              <Route path="home" element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="revision" element={<Revision />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;
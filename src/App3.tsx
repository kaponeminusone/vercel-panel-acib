// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import MonitoreoDashboard from './components/Monitor/MonitoreoDashboard';
import Sidebar from './components/Sidebar/Sidebar';
import CreationInterface from './components/Creation/CreationInterface';
import Home from './components/Home/Home';
import CreateUser from './components/Home/CreateUser';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ServiceUnavailable from './components/ServiceUnavailable/ServiceUnavailable';
import { UserProvider } from './context/UserContext';
import { AvailabilityProvider, useAvailability } from './context/AvailabilityContext';

const App = () => {
  return (
    <AvailabilityProvider>
      <UserProvider>
        <Router>
          <div className="App">
            <Sidebar />
            <div className="main-content-bar">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route element={<ProtectedRoutes />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/monitoreo" element={<MonitoreoDashboard />} />

                  {/* Ruta protegida para roles específicos */}
                  <Route
                    element={<ProtectedRoute allowedRoles={['admin', 'user']} redirectTo="/" />}
                  >
                    <Route path="/creacion" element={<CreationInterface />} />
                  </Route>
                </Route>

                {/* Ruta solo para administradores */}
                <Route
                  element={<ProtectedRoute allowedRoles={['admin']} redirectTo="/" />}
                >
                  <Route path="/dev" element={<CreateUser />} />
                </Route>

                <Route path="*" element={<ServiceUnavailable />} />
              </Routes>
            </div>
          </div>
        </Router>
      </UserProvider>
    </AvailabilityProvider>
  );
};

const ProtectedRoutes: React.FC = () => {
  const { availability, isLoading } = useAvailability();

  if (isLoading) return null;

  return availability?.disponible ? <Outlet /> : <ServiceUnavailable />;
};

export default App;

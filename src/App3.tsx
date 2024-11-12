// src/App.js
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import MonitoreoDashboard from './components/Monitor/MonitoreoDashboard';
import Sidebar from './components/Sidebar/Sidebar';
import CreationInterface from './components/Creation/CreationInterface';

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="main-content-bar">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/monitoreo" element={<MonitoreoDashboard />} />
            <Route path="/creacion" element={<CreationInterface />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

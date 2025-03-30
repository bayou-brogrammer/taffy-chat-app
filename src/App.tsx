// src/App.tsx
import React from 'react'; // No longer need useState, useEffect etc. directly here
import { Routes, Route } from 'react-router-dom';
import ChatInterface from './components/ChatInterface'; // Import the new component
import OAuthCallback from './components/OAuthCallback';
import './App.css';

// Main App component now sets up routes
const App: React.FC = () => { // Type as Functional Component
    return (
        <Routes>
            <Route path="/oauth2callback" element={<OAuthCallback />} />
            <Route path="/" element={<ChatInterface />} />
            {/* Optional: Add a catch-all route */}
            {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
        </Routes>
    );
}

export default App;
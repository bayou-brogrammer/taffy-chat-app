import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from client
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Use .tsx extension if needed, often implicit
import './index.css';

// Get the root element, assert it's not null
const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
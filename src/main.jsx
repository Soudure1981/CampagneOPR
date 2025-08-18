// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';                // ← important pour le style global
import App from './App.jsx';
import FloatingCloudSave from './components/FloatingCloudSave.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <FloatingCloudSave />
  </React.StrictMode>
);

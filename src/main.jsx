// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// 👇 remets l'import de TON CSS global (généralement index.css)
import './index.css';

import App from './App.jsx';
import FloatingCloudSave from './components/FloatingCloudSave.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <FloatingCloudSave />
  </React.StrictMode>
);

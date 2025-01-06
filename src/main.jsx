import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';   // <-- Make sure this points to the correct App.jsx
import './App.css';        // If you're using App.css

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './App'; // Import Root component ที่ wrap ด้วย AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
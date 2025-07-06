import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

console.log('Index.js loaded');

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('Root created', root);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App rendered');

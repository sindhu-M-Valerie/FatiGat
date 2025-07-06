import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb' }}>FatiGat Debug Test</h1>
      <p>✅ Server is working</p>
      <p>✅ React is loading</p>
      <p>✅ Components are rendering</p>
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9',
        borderRadius: '8px'
      }}>
        <strong>Status:</strong> If you can see this message, the basic React setup is working correctly.
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

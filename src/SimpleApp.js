import React from 'react';

const SimpleApp = () => {
  return (
    <div style={{ padding: '50px', fontSize: '24px', color: 'white', backgroundColor: 'black', minHeight: '100vh' }}>
      <h1 style={{ color: '#8B5CF6' }}>🚀 FatiGat Simple Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <button 
        onClick={() => alert('Button clicked!')}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#8B5CF6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default SimpleApp;

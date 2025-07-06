import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple test to verify React and DOM are working
function SimpleTest() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>FatiGat - Simple Test</h1>
      <p>If you can see this, React is working!</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Clicked {count} times
      </button>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<SimpleTest />);
} else {
  console.error('Root container not found!');
}

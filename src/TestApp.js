import React from 'react';

const TestApp = () => {
  return (
    <div style={{ padding: '20px', background: 'black', color: 'white', minHeight: '100vh' }}>
      <h1>FatiGat Test</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert('Button works!')}>Test Button</button>
    </div>
  );
};

export default TestApp;

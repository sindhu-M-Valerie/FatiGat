import React from 'react';
import { createRoot } from 'react-dom/client';

// Test basic imports first
console.log('Starting component import test...');

let step = 1;
const results = [];

try {
  // Step 1: Test React
  console.log(`Step ${step++}: Testing React...`);
  if (React && React.useState) {
    results.push('✅ React is working');
  } else {
    results.push('❌ React is not working');
  }
} catch (error) {
  results.push(`❌ React error: ${error.message}`);
}

// Step 2: Test components import
try {
  console.log(`Step ${step++}: Testing component imports...`);
  
  import('./components.jsx').then((components) => {
    console.log('Components loaded:', Object.keys(components));
    results.push(`✅ Components loaded: ${Object.keys(components).join(', ')}`);
    
    // Step 3: Test Phosphor icons
    import('@phosphor-icons/react').then((icons) => {
      console.log('Icons loaded:', Object.keys(icons).slice(0, 5));
      results.push(`✅ Phosphor icons loaded: ${Object.keys(icons).length} icons available`);
      
      // Render the test results
      renderResults();
    }).catch((error) => {
      results.push(`❌ Phosphor icons error: ${error.message}`);
      renderResults();
    });
    
  }).catch((error) => {
    results.push(`❌ Components error: ${error.message}`);
    renderResults();
  });
  
} catch (error) {
  results.push(`❌ Import error: ${error.message}`);
  renderResults();
}

function renderResults() {
  function TestResults() {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
        <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>FatiGat - Component Import Test</h1>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>Import Test Results</h2>
          {results.map((result, index) => (
            <div key={index} style={{ 
              marginBottom: '8px', 
              padding: '8px 12px', 
              backgroundColor: result.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${result.startsWith('✅') ? '#dcfce7' : '#fecaca'}`,
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {result}
            </div>
          ))}
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Console Output</h2>
          <p style={{ fontSize: '14px', color: '#666' }}>Check the browser console (F12) for detailed import logs.</p>
        </div>
      </div>
    );
  }
  
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<TestResults />);
  }
}

// Initial render with basic info
function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>FatiGat - Loading Component Test...</h1>
      <p>Testing imports, please wait...</p>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

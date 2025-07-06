import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [errors, setErrors] = React.useState([]);
  
  React.useEffect(() => {
    const handleError = (event) => {
      setErrors(prev => [...prev, {
        type: 'error',
        message: event.error?.message || event.message || 'Unknown error',
        stack: event.error?.stack
      }]);
    };
    
    const handleUnhandledRejection = (event) => {
      setErrors(prev => [...prev, {
        type: 'promise rejection',
        message: event.reason?.message || event.reason || 'Unhandled promise rejection'
      }]);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>FatiGat - Debug Page</h1>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>System Status</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>React:</strong> {React.version} ✅
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>DOM:</strong> {document ? 'Available' : 'Not available'} ✅
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Current Time:</strong> {new Date().toLocaleString()} ✅
        </div>
      </div>
      
      {errors.length > 0 && (
        <div style={{ backgroundColor: '#fee', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fcc' }}>
          <h2 style={{ color: '#c33', marginBottom: '10px' }}>Errors Detected ({errors.length})</h2>
          {errors.map((error, index) => (
            <div key={index} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fdd', borderRadius: '4px' }}>
              <strong>{error.type}:</strong> {error.message}
              {error.stack && (
                <pre style={{ fontSize: '12px', marginTop: '5px', overflow: 'auto' }}>
                  {error.stack}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
      
      {errors.length === 0 && (
        <div style={{ backgroundColor: '#efe', padding: '20px', borderRadius: '8px', border: '1px solid #cfc' }}>
          <h2 style={{ color: '#363', marginBottom: '10px' }}>No Errors Detected ✅</h2>
          <p>The basic React setup appears to be working correctly.</p>
        </div>
      )}
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Next Steps</h2>
        <p>If no errors are shown above, we can try loading the full FatiGat application.</p>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found!');
}

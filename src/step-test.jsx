import React from 'react';
import { createRoot } from 'react-dom/client';
import { SparkApp, PageContainer, Button } from './components.jsx';
import { Activity, Timer } from '@phosphor-icons/react';
import './index.css';

function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <SparkApp>
      <PageContainer>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(45deg, #3b82f6, #14b8a6)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity color="white" size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>FatiGat</h1>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Step-by-step test</p>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <p>✅ SparkApp component working</p>
            <p>✅ PageContainer component working</p>
            <p>✅ Phosphor Icons working</p>
            <p>✅ CSS imports working</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <Button 
              variant="primary" 
              icon={<Timer />}
              onClick={() => setCount(count + 1)}
            >
              Test Button (Clicked {count} times)
            </Button>
          </div>
          
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #0ea5e9',
            borderRadius: '8px'
          }}>
            <strong>Status:</strong> Basic components are working. Ready to test more complex features.
          </div>
        </div>
      </PageContainer>
    </SparkApp>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

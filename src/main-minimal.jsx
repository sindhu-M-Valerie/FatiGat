import React from 'react';
import { createRoot } from 'react-dom/client';
import { SparkApp, PageContainer, Button } from './components.jsx';
import { Activity } from '@phosphor-icons/react';
import './index.css';

function App() {
  return (
    <SparkApp>
      <PageContainer>
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FatiGat</h1>
              <p className="text-gray-600">Fatigue Mirror - Productivity & Wellness Tracker</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Current Project</h2>
              <p className="text-gray-600">No active project</p>
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={() => alert('Add project functionality coming soon!')}
              >
                Start New Project
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Stats</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Worked:</span>
                  <span className="font-medium">0h 0m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Breaks Taken:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Productivity:</span>
                  <span className="font-medium">--</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => alert('Feature coming soon!')}
                >
                  Take a Break
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => alert('Feature coming soon!')}
                >
                  View Analytics
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => alert('Feature coming soon!')}
                >
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </SparkApp>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found!');
}

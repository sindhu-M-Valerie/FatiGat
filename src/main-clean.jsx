import React from 'react';
import { createRoot } from 'react-dom/client';
import { 
  SparkApp, 
  PageContainer, 
  Card, 
  Button, 
  Input 
} from './components.jsx';
import { 
  Activity, 
  Timer, 
  Coffee, 
  Plus,
  Heart,
  Brain
} from '@phosphor-icons/react';

function FatiGatApp() {
  const [currentProject, setCurrentProject] = React.useState(null);
  const [projects, setProjects] = React.useState([]);
  const [isTracking, setIsTracking] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  
  const startTracking = () => {
    if (!currentProject) {
      alert('Please select or create a project first');
      return;
    }
    setIsTracking(true);
  };
  
  const stopTracking = () => {
    setIsTracking(false);
  };
  
  const addProject = () => {
    const name = prompt('Enter project name:');
    if (name) {
      const newProject = {
        id: Date.now(),
        name,
        timeSpent: 0,
        breaks: 0,
        tags: [],
        createdAt: new Date().toISOString()
      };
      setProjects([...projects, newProject]);
      setCurrentProject(newProject);
    }
  };
  
  return (
    <div className={darkMode ? 'dark' : ''}>
      <SparkApp>
        <PageContainer>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Activity className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FatiGat</h1>
                    <p className="text-gray-600 dark:text-gray-300">Fatigue Mirror - Productivity & Wellness Tracker</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button 
                    variant="plain" 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2"
                  >
                    {darkMode ? '☀️' : '🌙'}
                  </Button>
                  <Button 
                    variant="primary" 
                    icon={<Plus size={20} />}
                    onClick={addProject}
                  >
                    New Project
                  </Button>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Project */}
                <Card className="lg:col-span-2">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Current Project
                      </h2>
                      <div className="flex items-center gap-2">
                        <Timer className="text-blue-500" size={20} />
                        <span className="text-lg font-mono text-gray-700 dark:text-gray-300">
                          00:00:00
                        </span>
                      </div>
                    </div>
                    
                    {currentProject ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Brain className="text-blue-600" size={16} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {currentProject.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Created {new Date(currentProject.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <Button 
                            variant={isTracking ? "secondary" : "primary"}
                            onClick={isTracking ? stopTracking : startTracking}
                            icon={isTracking ? <Coffee size={20} /> : <Timer size={20} />}
                          >
                            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                          </Button>
                          
                          <Button 
                            variant="secondary"
                            onClick={() => alert('Take a break! Feature coming soon.')}
                            icon={<Heart size={20} />}
                          >
                            Take Break
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No Active Project
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Create a new project to start tracking your productivity
                        </p>
                        <Button 
                          variant="primary"
                          onClick={addProject}
                          icon={<Plus size={20} />}
                        >
                          Create Project
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
                
                {/* Statistics */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Today's Stats
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Time Worked</span>
                        <span className="font-semibold text-gray-900 dark:text-white">0h 0m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Breaks Taken</span>
                        <span className="font-semibold text-gray-900 dark:text-white">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Projects</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{projects.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Productivity</span>
                        <span className="font-semibold text-green-600">--</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Quick Actions
                      </h3>
                      <div className="space-y-2">
                        <Button 
                          variant="plain" 
                          className="w-full justify-start text-left"
                          onClick={() => alert('Analytics coming soon!')}
                        >
                          📊 View Analytics
                        </Button>
                        <Button 
                          variant="plain" 
                          className="w-full justify-start text-left"
                          onClick={() => alert('Settings coming soon!')}
                        >
                          ⚙️ Settings
                        </Button>
                        <Button 
                          variant="plain" 
                          className="w-full justify-start text-left"
                          onClick={() => alert('Export data coming soon!')}
                        >
                          📤 Export Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Projects List */}
              {projects.length > 0 && (
                <Card className="mt-6">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Projects
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.map((project) => (
                        <div 
                          key={project.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            currentProject?.id === project.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setCurrentProject(project)}
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </PageContainer>
      </SparkApp>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<FatiGatApp />);
} else {
  console.error('Root container not found!');
}

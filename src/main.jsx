import * as React from "react";
import { createRoot } from "react-dom/client";
import * as d3 from "d3";
import FatiGatLogo from "./FatiGatlogo.jsx";
import { 
  SparkApp, 
  PageContainer,
  Card,
  Button,
  Input,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Select,
  useKV
} from "./components.jsx";
import { 
  Timer, 
  Coffee,
  Brain,
  ChartLine,
  Plus,
  Lightning,
  Gauge,
  Clock,
  Tag,
  FunnelSimple
} from "@phosphor-icons/react";
import "./index.css";

// Predefined project tags
const PROJECT_TAGS = [
  "Development",
  "Design",
  "Research",
  "Documentation",
  "Meeting",
  "Planning",
  "Bug Fix",
  "Feature"
];

// Helper function to calculate productivity score
const calculateProductivityScore = (project) => {
  if (!project.timeSpent) return 0;
  const breakRatio = project.breaks / (project.timeSpent / 2700);
  const consistencyScore = project.sessionLengths?.reduce((acc, length) => 
    acc + (length > 1800 && length < 3600 ? 1 : 0), 0) / (project.sessionLengths?.length || 1);
  
  return Math.round((0.5 * Math.min(breakRatio, 1) + 0.5 * consistencyScore) * 100);
};

// Generate personalized suggestions based on work patterns
const generateSuggestions = (project) => {
  const suggestions = [];
  
  if (project.breaks / (project.timeSpent / 2700) < 0.8) {
    suggestions.push("Consider taking more regular breaks to maintain productivity");
  }
  
  const avgSessionLength = project.sessionLengths?.reduce((a, b) => a + b, 0) / project.sessionLengths?.length || 0;
  if (avgSessionLength > 3600) {
    suggestions.push("Your sessions are quite long. Try breaking them into smaller chunks");
  }
  
  if (project.timeSpent > 14400 && project.breaks < 4) {
    suggestions.push("Remember to take regular breaks to prevent fatigue");
  }
  
  return suggestions.length ? suggestions : ["Your work patterns look healthy! Keep it up!"];
};

// Timeline visualization component
function Timeline({ project }) {
  const svgRef = React.useRef();
  
  React.useEffect(() => {
    if (!project || !project.timeline || !svgRef.current) return;

    const width = svgRef.current.clientWidth || 400;
    const height = 60;
    const margin = { top: 10, right: 10, bottom: 20, left: 40 };

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const x = d3.scaleTime()
      .domain([today, d3.timeDay.offset(today, 1)])
      .range([margin.left, width - margin.right]);

    const xAxis = d3.axisBottom(x)
      .ticks(8)
      .tickFormat(d3.timeFormat("%H:%M"));

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg.selectAll("rect.work")
      .data(project.timeline.filter(t => t.type === 'work'))
      .enter()
      .append("rect")
      .attr("class", "work")
      .attr("x", d => x(new Date(d.start)))
      .attr("y", margin.top)
      .attr("width", d => x(new Date(d.end)) - x(new Date(d.start)))
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "#3b82f6")
      .attr("opacity", 0.6);

    svg.selectAll("rect.break")
      .data(project.timeline.filter(t => t.type === 'break'))
      .enter()
      .append("rect")
      .attr("class", "break")
      .attr("x", d => x(new Date(d.start)))
      .attr("y", margin.top)
      .attr("width", d => x(new Date(d.end)) - x(new Date(d.start)))
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "#10b981")
      .attr("opacity", 0.6);

  }, [project]);

  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full"></svg>
    </div>
  );
}

function App() {
  const [projects, setProjects] = useKV("fatigue-projects", []);
  const [activeProject, setActiveProject] = React.useState(null);
  const [timeSpent, setTimeSpent] = React.useState(0);
  const [breakDue, setBreakDue] = React.useState(false);
  const [sessionStart, setSessionStart] = React.useState(null);
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectTags, setNewProjectTags] = React.useState([]);
  const [username, setUsername] = useKV("fatigue-username", "");
  const [showUsernameInput, setShowUsernameInput] = React.useState(!username);
  
  // Backend data fetching states
  const [backendProjects, setBackendProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [useBackend, setUseBackend] = React.useState(true); // Default to true for real-time data
  
  // Username search states
  const [searchUsername, setSearchUsername] = React.useState("");
  const [searchedUserData, setSearchedUserData] = React.useState(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState(null);
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  
  // Real-time data polling
  const [lastDataUpdate, setLastDataUpdate] = React.useState(Date.now());
  const [isPolling, setIsPolling] = React.useState(false);

  // Real-time polling configuration
  const POLLING_INTERVAL = 30000; // 30 seconds
  const [pollingEnabled, setPollingEnabled] = React.useState(true);
  const [connectionStatus, setConnectionStatus] = React.useState('connecting'); // 'connected', 'connecting', 'error'

  // Fetch user data from backend when username changes
  React.useEffect(() => {
    if (!username || !useBackend || connectionStatus !== 'connected') return;
    
    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/userdata?username=${encodeURIComponent(username)}`)
      .then(res => {
        if (!res.ok) throw new Error("User not found or server error");
        return res.json();
      })
      .then(data => {
        setBackendProjects(data.projects || []);
      })
      .catch(err => {
        setBackendProjects([]);
        setError(err.message);
        console.error('Error fetching user data:', err);
      })
      .finally(() => setLoading(false));
  }, [username, useBackend, connectionStatus]);

  // Real-time polling for current user's data when using backend
  React.useEffect(() => {
    if (!username || !useBackend || connectionStatus !== 'connected') return;

    const pollCurrentUserData = () => {
      fetch(`${API_BASE_URL}/api/userdata?username=${encodeURIComponent(username)}`)
        .then(res => {
          if (!res.ok) throw new Error("User not found or server error");
          return res.json();
        })
        .then(data => {
          setBackendProjects(data.projects || []);
          setLastDataUpdate(Date.now());
        })
        .catch(err => {
          console.warn('Polling error for current user:', err.message);
        });
    };

    // Poll every 30 seconds for real-time updates
    const pollInterval = setInterval(pollCurrentUserData, POLLING_INTERVAL);
    
    return () => clearInterval(pollInterval);
  }, [username, useBackend, connectionStatus]);

  // Determine which projects to use (local or backend)
  const currentProjects = useBackend ? backendProjects : projects;

  // Aggregate statistics across all projects
  const totalTimeSpent = currentProjects.reduce((acc, p) => acc + (p.timeSpent || 0), 0);
  const totalBreaks = currentProjects.reduce((acc, p) => acc + (p.breaks || 0), 0);
  const totalProjects = currentProjects.length;
  const avgProductivityScore = currentProjects.length > 0 
    ? currentProjects.reduce((acc, p) => acc + calculateProductivityScore(p), 0) / currentProjects.length 
    : 0;

  React.useEffect(() => {
    let interval;
    if (activeProject) {
      if (!sessionStart) {
        const now = Date.now();
        setSessionStart(now);
        setProjects(prev => prev.map(p => 
          p.id === activeProject.id ? {
            ...p,
            timeline: [...(p.timeline || []), {
              type: 'work',
              start: now,
              end: now
            }]
          } : p
        ));
      }
      interval = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          if (newTime % 2700 === 0) {
            setBreakDue(true);
          }
          return newTime;
        });
      }, 1000);
    } else if (sessionStart) {
      const now = Date.now();
      const sessionLength = (now - sessionStart) / 1000;
      setProjects(prev => prev.map(p => 
        p.id === activeProject?.id ? {
          ...p,
          timeSpent: (p.timeSpent || 0) + sessionLength,
          sessionLengths: [...(p.sessionLengths || []), sessionLength],
          timeline: (p.timeline || []).map((t, i) => 
            i === p.timeline.length - 1 ? { ...t, end: now } : t
          )
        } : p
      ));
      setSessionStart(null);
      setTimeSpent(0);
    }
    return () => clearInterval(interval);
  }, [activeProject, sessionStart]);

  const addProject = () => {
    if (newProjectName.trim()) {
      setProjects(prev => [...prev, {
        id: Date.now(),
        name: newProjectName,
        tags: newProjectTags,
        timeSpent: 0,
        breaks: 0,
        sessionLengths: [],
        timeline: []
      }]);
      setNewProjectName("");
      setNewProjectTags([]);
    }
  };

  const takeBreak = (projectId) => {
    const now = Date.now();
    setProjects(prev => prev.map(p => 
      p.id === projectId ? {
        ...p,
        breaks: p.breaks + 1,
        timeline: [...(p.timeline || []), {
          type: 'break',
          start: now,
          end: now + (5 * 60 * 1000)
        }]
      } : p
    ));
    setBreakDue(false);
  };

  // Real-time data polling for searched user
  React.useEffect(() => {
    if (!showSearchResults || !searchedUserData?.username || !pollingEnabled) return;

    const pollUserData = () => {
      setIsPolling(true);
      
      fetch(`${API_BASE_URL}/api/userdata?username=${encodeURIComponent(searchedUserData.username)}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API endpoint not available - received HTML instead of JSON');
          }
          return res.json();
        })
        .then(data => {
          setSearchedUserData(prevData => ({
            ...prevData,
            projects: data.projects || [],
            totalTimeSpent: data.projects?.reduce((acc, p) => acc + (p.timeSpent || 0), 0) || 0,
            totalBreaks: data.projects?.reduce((acc, p) => acc + (p.breaks || 0), 0) || 0,
            avgProductivityScore: data.projects?.length > 0 
              ? data.projects.reduce((acc, p) => acc + calculateProductivityScore(p), 0) / data.projects.length 
              : 0
          }));
          setLastDataUpdate(Date.now());
        })
        .catch(err => {
          console.warn('Polling error:', err.message);
          // Don't update error state during polling to avoid UI flicker
        })
        .finally(() => setIsPolling(false));
    };

    // Poll every 30 seconds for real-time updates
    const pollInterval = setInterval(pollUserData, POLLING_INTERVAL);
    
    return () => clearInterval(pollInterval);
  }, [showSearchResults, searchedUserData?.username, pollingEnabled]);

  // Search for user data (real API only)
  const searchForUser = () => {
    if (!searchUsername.trim()) return;
    
    console.log('🔍 Searching for user:', searchUsername);
    setSearchLoading(true);
    setSearchError(null);
    setShowSearchResults(false);

    const url = `${API_BASE_URL}/api/userdata?username=${encodeURIComponent(searchUsername)}`;
    console.log('🌐 Fetching from:', url);
    
    fetch(url)
      .then(res => {
        console.log('📡 Search response status:', res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const contentType = res.headers.get('content-type');
        console.log('📄 Content type:', contentType);
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API endpoint not available - received HTML instead of JSON');
        }
        return res.json();
      })
      .then(data => {
        console.log('✅ Search data received:', data);
        setSearchedUserData({
          username: searchUsername,
          projects: data.projects || [],
          totalTimeSpent: data.projects?.reduce((acc, p) => acc + (p.timeSpent || 0), 0) || 0,
          totalBreaks: data.projects?.reduce((acc, p) => acc + (p.breaks || 0), 0) || 0,
          avgProductivityScore: data.projects?.length > 0 
            ? data.projects.reduce((acc, p) => acc + calculateProductivityScore(p), 0) / data.projects.length 
            : 0
        });
        setShowSearchResults(true);
        setLastDataUpdate(Date.now());
      })
      .catch(err => {
        console.error('❌ Search failed:', err);
        console.error('Error details:', err.message, err.stack);
        setSearchedUserData(null);
        // Provide helpful error messages
        if (err.message.includes('HTML instead of JSON')) {
          setSearchError('Backend API not available. Please ensure the API endpoint is set up.');
        } else if (err.message.includes('HTTP 404')) {
          setSearchError('User not found.');
        } else if (err.message.includes('Failed to fetch')) {
          setSearchError('Cannot connect to server. Please check your connection.');
        } else {
          setSearchError(err.message);
        }
        setShowSearchResults(false);
      })
      .finally(() => setSearchLoading(false));
  };

  const filteredProjects = currentProjects.filter(project => 
    selectedTags.length === 0 || 
    project.tags?.some(tag => selectedTags.includes(tag))
  );

  // Sync local data to backend when backend is enabled
  const syncLocalDataToBackend = async () => {
    if (!username || !useBackend || projects.length === 0) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/userdata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          projects: projects
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync data to backend');
      }
      
      console.log('Local data synced to backend successfully');
    } catch (error) {
      console.error('Error syncing local data to backend:', error);
    }
  };

  // Auto-sync local data when switching to backend mode
  React.useEffect(() => {
    if (useBackend && projects.length > 0) {
      syncLocalDataToBackend();
    }
  }, [useBackend]);  // Get the correct API base URL based on environment
  const getApiBaseUrl = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3004';
    } else {
      // For GitHub Codespaces, construct the backend URL
      const hostname = window.location.hostname;
      const backendUrl = hostname.replace('-3000.', '-3004.');
      return `https://${backendUrl}`;
    }
  };

  const API_BASE_URL = getApiBaseUrl();

  // Health check on component mount
  React.useEffect(() => {
    if (!useBackend) return;
    
    const checkConnection = async () => {
      console.log('🔍 Checking backend connection...');
      setConnectionStatus('connecting');
      try {
        const healthUrl = `${API_BASE_URL}/api/health`;
        console.log('🌐 Fetching from', healthUrl);
        const response = await fetch(healthUrl);
        console.log('📡 Response status:', response.status, response.statusText);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend connection established:', data);
          setConnectionStatus('connected');
        } else {
          throw new Error(`Backend responded with error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('❌ Backend connection failed:', error);
        console.error('Error details:', error.message, error.stack);
        setConnectionStatus('error');
        // Retry connection after 5 seconds
        setTimeout(checkConnection, 5000);
      }
    };

    checkConnection();
    // Also check every 30 seconds
    const intervalId = setInterval(checkConnection, 30000);
    return () => clearInterval(intervalId);
  }, [useBackend]);

  return (
    <SparkApp>
      <div className="min-h-screen bg-black text-white overflow-hidden">
        {/* Debug Panel */}
        {useBackend && (
          <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-mono ${
            connectionStatus === 'connected' ? 'bg-green-900/80' :
            connectionStatus === 'connecting' ? 'bg-yellow-900/80' :
            'bg-red-900/80'
          } backdrop-blur-sm border-b border-gray-700`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <span>
                Backend Status: {connectionStatus.toUpperCase()} 
                {connectionStatus === 'connected' && ' ✅'}
                {connectionStatus === 'connecting' && ' 🔄'}
                {connectionStatus === 'error' && ' ❌'}
              </span>
              <span className="text-xs opacity-70">
                API: http://localhost:3004 | Frontend: {window.location.origin}
              </span>
            </div>
          </div>
        )}
        
        {/* Animated background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-blue-900/10"></div>
        </div>
        
        {/* Header */}
        <header className={`relative z-10 border-b border-gray-800/50 backdrop-blur-sm ${useBackend ? 'mt-10' : ''}`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <FatiGatLogo size={32} color="#ffffff" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      FatiGat
                    </h1>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {username && (
                  <div className="flex items-center space-x-3 bg-gray-900/50 rounded-full px-4 py-2 border border-gray-700/50">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">{username}</span>
                      {useBackend && (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Real-time data enabled"></div>
                      )}
                    </div>
                    <Button
                      variant="plain"
                      size="small"
                      onClick={() => setShowUsernameInput(true)}
                      className="text-xs text-gray-500 hover:text-gray-300"
                    >
                      edit
                    </Button>
                  </div>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      icon={<Plus />} 
                      variant="primary" 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white"
                    >
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New Project</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Start tracking a new project to monitor your productivity patterns.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">Project Name</label>
                        <Input 
                          placeholder="Enter project name..."
                          value={newProjectName}
                          onChange={e => setNewProjectName(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">Tags</label>
                        <div className="flex flex-wrap gap-2">
                          {PROJECT_TAGS.map(tag => (
                            <Button
                              key={tag}
                              variant={newProjectTags.includes(tag) ? "primary" : "secondary"}
                              size="small"
                              onClick={() => {
                                setNewProjectTags(prev => 
                                  prev.includes(tag) 
                                    ? prev.filter(t => t !== tag)
                                    : [...prev, tag]
                                );
                              }}
                              className={newProjectTags.includes(tag) 
                                ? "bg-purple-600 text-white border-purple-500" 
                                : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                              }
                            >
                              {tag}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Button 
                        variant="primary" 
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white"
                        onClick={addProject}
                      >
                        Create Project
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Username Input Modal */}
        <Dialog open={showUsernameInput} onOpenChange={setShowUsernameInput}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <FatiGatLogo size={32} color="#ffffff" />
                </div>
              </div>
              <DialogTitle className="text-white text-center text-xl">
                {username ? "Update Your Username" : "Welcome to FatiGat!"}
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-center">
                {username 
                  ? "Change your display name to personalize your experience" 
                  : "Enter your username to start tracking your productivity and wellness patterns"
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-purple-500/20 rounded flex items-center justify-center">
                    <span className="text-purple-400 text-xs">👤</span>
                  </div>
                  <label className="text-sm font-medium text-gray-300">Username</label>
                </div>
                <Input 
                  placeholder="e.g., your-name or github-username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 This will be used to identify your productivity data and can be shared with others
                </p>
              </div>
              <Button 
                variant="primary" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white py-3"
                onClick={() => {
                  if (username.trim()) {
                    setShowUsernameInput(false);
                  }
                }}
                disabled={!username.trim()}
              >
                {username ? "Update Username" : "Start Your Journey"} ✨
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <FatiGatLogo size={120} color="#8b5cf6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                FatiGat
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Every pause is progress in disguise
            </p>

            {!username ? (
              // Enhanced Landing Page for New Users
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    Welcome to Your Productivity Journey! 🚀
                  </h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    FatiGat helps you understand your work patterns, track breaks, and optimize your productivity. 
                    Get insights into your fatigue levels and learn when to take breaks for maximum effectiveness.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Timer className="text-purple-400" size={24} />
                      </div>
                      <h3 className="text-white font-medium mb-2">Track Time</h3>
                      <p className="text-gray-400 text-sm">Monitor your work sessions and productivity patterns</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Coffee className="text-green-400" size={24} />
                      </div>
                      <h3 className="text-white font-medium mb-2">Smart Breaks</h3>
                      <p className="text-gray-400 text-sm">Get reminded to take breaks and prevent fatigue</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ChartLine className="text-blue-400" size={24} />
                      </div>
                      <h3 className="text-white font-medium mb-2">Analytics</h3>
                      <p className="text-gray-400 text-sm">Visualize your productivity and wellness data</p>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="primary" 
                        size="large"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white px-8 py-4 text-lg font-medium"
                      >
                        🎯 Start Tracking Your Productivity
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
                      <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <FatiGatLogo size={32} color="#ffffff" />
                          </div>
                        </div>
                        <DialogTitle className="text-white text-center text-xl">
                          Let's Get Started!
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 text-center">
                          Enter your username to begin tracking your productivity and wellness patterns
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-purple-500/20 rounded flex items-center justify-center">
                              <span className="text-purple-400 text-xs">👤</span>
                            </div>
                            <label className="text-sm font-medium text-gray-300">Choose Your Username</label>
                          </div>
                          <Input 
                            placeholder="e.g., your-name or github-username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
                            autoFocus
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            💡 This will be used to identify your productivity data and can be shared with others
                          </p>
                        </div>
                        <Button 
                          variant="primary" 
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white py-3"
                          onClick={() => {
                            if (username.trim()) {
                              setShowUsernameInput(false);
                            }
                          }}
                          disabled={!username.trim()}
                        >
                          Start Your Journey ✨
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="text-gray-500 text-sm">
                  <p>✨ Join thousands of users optimizing their productivity with FatiGat</p>
                </div>
              </div>
            ) : !currentProjects.length && !loading ? (
              // Existing user with no projects
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="primary" 
                    size="large"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white px-8 py-3 text-lg"
                  >
                    Start Your First Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Project</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Start tracking a new project to monitor your productivity patterns.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-300">Project Name</label>
                      <Input 
                        placeholder="Enter project name..."
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-300">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {PROJECT_TAGS.map(tag => (
                          <Button
                            key={tag}
                            variant={newProjectTags.includes(tag) ? "primary" : "secondary"}
                            size="small"
                            onClick={() => {
                              setNewProjectTags(prev => 
                                prev.includes(tag) 
                                  ? prev.filter(t => t !== tag)
                                  : [...prev, tag]
                              );
                            }}
                            className={newProjectTags.includes(tag) 
                              ? "bg-purple-600 text-white border-purple-500" 
                              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                            }
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 text-white"
                      onClick={addProject}
                    >
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : null}
          </div>

          {/* Username Search Section */}
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Brain className="text-blue-400" size={16} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Explore User Productivity 🔍</h3>
                <p className="text-sm text-gray-400">Discover insights from other users' productivity patterns and real-time data</p>
              </div>
              {showSearchResults && (
                <div className="flex items-center gap-2 text-green-400">
                  <div className={`w-2 h-2 rounded-full ${isPolling ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                  <span className="text-xs">
                    {isPolling ? 'Updating...' : `Live • Updated ${new Date(lastDataUpdate).toLocaleTimeString()}`}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-blue-500/20 rounded flex items-center justify-center">
                    <span className="text-blue-400 text-xs">🔎</span>
                  </div>
                  <label className="text-sm font-medium text-gray-300">Search by Username</label>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="e.g., sindhu-m-valerie, demo-user, or any username..."
                    value={searchUsername}
                    onChange={e => setSearchUsername(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && searchForUser()}
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    variant="primary"
                    onClick={searchForUser}
                    disabled={!searchUsername.trim() || searchLoading}
                    className="bg-blue-600 hover:bg-blue-500 text-white border-blue-500 px-6"
                  >
                    {searchLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Brain size={16} />
                        <span>Search</span>
                      </div>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Try these sample users: <button 
                    onClick={() => setSearchUsername('sindhu-m-valerie')}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >sindhu-m-valerie</button>, <button 
                    onClick={() => setSearchUsername('demo-user')}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >demo-user</button>, or <button 
                    onClick={() => setSearchUsername('test-user')}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >test-user</button>
                </p>
              </div>
            </div>
            
            {searchLoading && (
              <div className="flex items-center gap-2 text-blue-400 mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Fetching real-time productivity data...</span>
              </div>
            )}
            
            {searchError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">Error: {searchError}</p>
              </div>
            )}
            
            {showSearchResults && searchedUserData && (
              <div className="mt-6 space-y-6">
                <div className="border-t border-gray-700/50 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {searchedUserData.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{searchedUserData.username}</h4>
                      <p className="text-sm text-gray-400">User Profile & Productivity Data</p>
                    </div>
                  </div>
                  
                  {/* User Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="text-purple-400" size={16} />
                        <span className="text-sm text-gray-400">Total Projects</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{searchedUserData.projects.length}</p>
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge className="text-purple-400" size={16} />
                        <span className="text-sm text-gray-400">Avg Productivity</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-400">
                        {Math.round(searchedUserData.avgProductivityScore)}%
                      </p>
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Coffee className="text-green-400" size={16} />
                        <span className="text-sm text-gray-400">Total Breaks</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400">{searchedUserData.totalBreaks}</p>
                    </div>
                  </div>
                  
                  {/* User's Projects Breakdown */}
                  {searchedUserData.projects.length > 0 ? (
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                        <ChartLine className="text-blue-400" size={18} />
                        Project Breakdown
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchedUserData.projects.map((project, index) => (
                          <div key={index} className="bg-gray-800/20 rounded-xl p-4 border border-gray-700/30">
                            <h6 className="font-semibold text-white mb-3">{project.name}</h6>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Timer className="text-blue-400" size={12} />
                                  <span className="text-xs text-gray-400">Time Spent</span>
                                </div>
                                <span className="text-xs font-medium text-white">
                                  {Math.floor((project.timeSpent || 0) / 3600)}h {Math.floor(((project.timeSpent || 0) % 3600) / 60)}m
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Gauge className="text-purple-400" size={12} />
                                  <span className="text-xs text-gray-400">Productivity Score</span>
                                </div>
                                <span className="text-xs font-medium text-purple-400">
                                  {calculateProductivityScore(project)}%
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Coffee className="text-green-400" size={12} />
                                  <span className="text-xs text-gray-400">Breaks Taken</span>
                                </div>
                                <span className="text-xs font-medium text-green-400">
                                  {project.breaks || 0}
                                </span>
                              </div>
                              
                              {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {project.tags.map((tag, tagIndex) => (
                                    <span 
                                      key={tagIndex}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                    >
                                      <Tag size={8} />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Brain className="text-gray-400" size={24} />
                      </div>
                      <h5 className="text-lg font-semibold text-white mb-2">No Projects Found</h5>
                      <p className="text-gray-400">This user hasn't created any projects yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Data Source Toggle */}
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 mb-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Lightning className="text-purple-400" size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Data Source</h3>
                  <p className="text-sm text-gray-400">
                    {useBackend ? 'Using real-time backend data' : 'Using local storage'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {useBackend && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                      connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                      'bg-red-400'
                    }`}></div>
                    <span className="text-xs text-gray-400">
                      {connectionStatus === 'connected' ? 'Live Updates' :
                       connectionStatus === 'connecting' ? 'Connecting...' :
                       'Connection Error'}
                    </span>
                  </div>
                )}
                <Button
                  variant={useBackend ? "primary" : "secondary"}
                  size="small"
                  onClick={() => setUseBackend(!useBackend)}
                  className={useBackend 
                    ? "bg-blue-600 text-white border-blue-500" 
                    : "bg-gray-600 text-gray-300 border-gray-500"
                  }
                >
                  {useBackend ? "Backend API" : "Local Storage"}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          {currentProjects.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Your Productivity Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Gauge className="text-purple-400" size={24} />
                      <h3 className="text-lg font-semibold text-white">Productivity Score</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-400 text-center">
                      {Math.round(avgProductivityScore)}%
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Coffee className="text-green-400" size={24} />
                      <h3 className="text-lg font-semibold text-white">Breaks</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-400 text-center">{totalBreaks}</p>
                  </div>
                </div>
              </div>
              
              {/* Individual Project Stats */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">Project Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProjects.map(project => (
                    <div key={project.id} className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-white truncate">{project.name}</h4>
                        {activeProject?.id === project.id && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Timer className="text-blue-400" size={14} />
                            <span className="text-sm text-gray-400">Time</span>
                          </div>
                          <span className="text-sm font-medium text-white">
                            {Math.floor((project.timeSpent || 0) / 3600)}h {Math.floor(((project.timeSpent || 0) % 3600) / 60)}m
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Gauge className="text-purple-400" size={14} />
                            <span className="text-sm text-gray-400">Score</span>
                          </div>
                          <span className="text-sm font-medium text-purple-400">
                            {calculateProductivityScore(project)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Coffee className="text-green-400" size={14} />
                            <span className="text-sm text-gray-400">Breaks</span>
                          </div>
                          <span className="text-sm font-medium text-green-400">
                            {project.breaks || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filter Section */}
          {currentProjects.length > 0 && (
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FunnelSimple className="text-purple-400" size={20} />
                <h3 className="text-lg font-semibold text-white">Filter Projects</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {PROJECT_TAGS.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "primary" : "secondary"}
                    size="small"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={selectedTags.includes(tag) 
                      ? "bg-purple-600 text-white border-purple-500" 
                      : "bg-gray-800/50 text-gray-300 border-gray-700/50 hover:bg-gray-700/50"
                    }
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Grid */}
          <div className="space-y-6">
            {loading && (
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-800/50 text-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Loading user data...</h3>
                <p className="text-gray-400">Please wait while we fetch your projects.</p>
              </div>
            )}
            
            {error && (
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-800/50 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-red-400 text-2xl">⚠️</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Error loading data</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <Button
                  variant="primary"
                  onClick={() => setUseBackend(false)}
                  className="bg-gray-600 hover:bg-gray-500 text-white"
                >
                  Switch to Local Data
                </Button>
              </div>
            )}
            
            {!loading && !error && filteredProjects.length === 0 && currentProjects.length > 0 ? (
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-800/50 text-center">
                <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FunnelSimple className="text-purple-400" size={40} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No projects match your filters</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filter criteria to see more projects.</p>
              </div>
            ) : (
              filteredProjects.map(project => (
                <div key={project.id} className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 overflow-hidden hover:bg-gray-900/40 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                          {activeProject?.id === project.id && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags?.map(tag => (
                            <span 
                              key={tag}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            >
                              <Tag size={10} />
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-400">
                          Total time: {Math.floor((project.timeSpent || 0) / 3600)}h {Math.floor(((project.timeSpent || 0) % 3600) / 60)}m
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          icon={<Timer />}
                          variant={activeProject?.id === project.id ? "primary" : "secondary"}
                          onClick={() => setActiveProject(activeProject?.id === project.id ? null : project)}
                          className={activeProject?.id === project.id 
                            ? "bg-green-600 text-white hover:bg-green-500 border-green-500" 
                            : "bg-gray-800/50 text-gray-300 border-gray-700/50 hover:bg-gray-700/50"
                          }
                        >
                          {activeProject?.id === project.id ? 'Stop' : 'Start'}
                        </Button>
                        <Button 
                          icon={<Coffee />} 
                          variant="plain"
                          onClick={() => takeBreak(project.id)}
                          className="bg-gray-800/50 text-gray-300 border-gray-700/50 hover:bg-gray-700/50"
                        >
                          Break
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Gauge className="text-purple-400" size={16} />
                        <span className="text-sm text-gray-300">
                          Productivity: <span className="font-semibold text-white">{calculateProductivityScore(project)}%</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coffee className="text-green-400" size={16} />
                        <span className="text-sm text-gray-300">
                          Breaks: <span className="font-semibold text-white">{project.breaks || 0}</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-800/30 p-4 rounded-xl mb-4 border border-gray-700/50">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-300">
                        <Clock className="text-purple-400" size={16} />
                        Daily Timeline
                      </h4>
                      <Timeline project={project} />
                    </div>

                    <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-300">
                        <Lightning className="text-blue-400" size={16} />
                        Wellness Suggestions
                      </h4>
                      <ul className="text-sm space-y-2">
                        {generateSuggestions(project).map((suggestion, i) => (
                          <li key={i} className="text-gray-400 flex items-start gap-2">
                            <span className="text-blue-400 mt-1 text-xs">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Break Reminder Dialog */}
        <Dialog open={breakDue} onOpenChange={setBreakDue}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-center text-white">Time for a Break! ☕</DialogTitle>
              <DialogDescription className="text-center text-gray-400">
                You've been working for 45 minutes. Taking regular breaks helps maintain productivity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <h4 className="font-medium mb-2 text-white">Suggested activities:</h4>
                <ul className="text-sm space-y-1 text-gray-400">
                  <li>• Take a 5-minute walk</li>
                  <li>• Do some quick stretches</li>
                  <li>• Rest your eyes by looking at something distant</li>
                  <li>• Get a glass of water</li>
                  <li>• Practice deep breathing</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="primary" 
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 border-0 text-white"
                  onClick={() => {
                    setBreakDue(false);
                    if (activeProject) {
                      takeBreak(activeProject.id);
                    }
                  }}
                >
                  Start Break
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setBreakDue(false)}
                  className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                >
                  Remind me later
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SparkApp>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
import React from 'react';
import './index.css';

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const userDataCache = new Map();

// Replace lines 9-32 with:
const TwinklingEmoji = ({ emoji, style }) => {
  const animationDuration = 4 + Math.random() * 6; // 4-10 seconds
  const floatDuration = 8 + Math.random() * 4; // 8-12 seconds
  const driftDuration = 6 + Math.random() * 8; // 6-14 seconds
  const delay = Math.random() * 5; // 0-5 seconds delay
  
  return (
    <div
      className="absolute text-4xl pointer-events-none select-none"
      style={{
        ...style,
        animation: `
          twinkle ${animationDuration}s infinite ease-in-out,
          float ${floatDuration}s infinite ease-in-out,
          drift ${driftDuration}s infinite linear
        `,
        animationDelay: `${delay}s, ${delay + 1}s, ${delay + 2}s`,
        filter: 'drop-shadow(0 0 12px rgba(147, 51, 234, 0.8)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))',
        willChange: 'transform, opacity',
        textShadow: '0 0 15px rgba(255, 255, 255, 0.7)'
      }}
    >
      {emoji}
    </div>
  );
};

// Twinkling Emojis Container
// Replace lines 36-64 with:
const TwinklingEmojisContainer = () => {
  const emojis = ["☕","⏰","🛌","🫠","🥱","😵", "😴", "😰", "😶‍🌫️","🙃","🏨","☁️"];
  
  // Create more emojis with varied positioning
  const twinklingEmojis = Array.from({ length: 20 }, (_, i) => {
    const emoji = emojis[i % emojis.length];
    return {
      id: i,
      emoji,
      top: `${5 + Math.random() * 90}%`,
      left: `${5 + Math.random() * 90}%`,
      zIndex: Math.floor(Math.random() * 10) + 100 // Much higher z-index
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {twinklingEmojis.map((item) => (
        <TwinklingEmoji
          key={item.id}
          emoji={item.emoji}
          style={{
            top: item.top,
            left: item.left,
            zIndex: item.zIndex
          }}
        />
      ))}
    </div>
  );
};

// Utility function for seeded random numbers
const random = (min, max, seed) => {
  const x = Math.sin(seed) * 10000;
  const randomValue = x - Math.floor(x);
  return Math.floor(randomValue * (max - min + 1)) + min;
};

// Create demo data for testing
const createDemoData = (username) => {
  // Generate varied project names and descriptions
  const projectTemplates = [
    { name: 'awesome-project', desc: 'A fantastic web application', tech: ['JavaScript', 'React', 'frontend'] },
    { name: 'data-analyzer', desc: 'Advanced data analysis tools', tech: ['Python', 'data-science', 'machine-learning'] },
    { name: 'mobile-app', desc: 'Cross-platform mobile application', tech: ['React Native', 'mobile', 'iOS'] },
    { name: 'api-server', desc: 'RESTful API backend service', tech: ['Node.js', 'Express', 'backend'] },
    { name: 'ml-model', desc: 'Machine learning prediction model', tech: ['Python', 'TensorFlow', 'AI'] },
    { name: 'game-engine', desc: 'Lightweight 2D game engine', tech: ['C++', 'OpenGL', 'gaming'] },
    { name: 'blog-platform', desc: 'Modern blogging platform', tech: ['Vue.js', 'Nuxt', 'CMS'] },
    { name: 'chat-app', desc: 'Real-time messaging application', tech: ['Socket.io', 'WebRTC', 'realtime'] }
  ];

  // Generate 2-4 projects per user
  const projectCount = random(2, 4, 1);
  const selectedProjects = [];
  const usedIndices = new Set();
  
  for (let i = 0; i < projectCount; i++) {
    let projectIndex;
    do {
      projectIndex = random(0, projectTemplates.length - 1, i + 10);
    } while (usedIndices.has(projectIndex));
    usedIndices.add(projectIndex);
    
    const template = projectTemplates[projectIndex];
    const project = {
      id: i + 1,
      name: `${template.name}-${random(1, 999, i + 20)}`,
      tags: [...template.tech],
      timeSpent: random(1800, 43200, i + 30), // 30min to 12 hours
      breaks: random(1, 15, i + 40),
      sessionLengths: [
        random(1800, 7200, i + 50), // 30min to 2hr sessions
        random(1800, 7200, i + 60),
        random(1800, 7200, i + 70)
      ],
      description: `${template.desc} - ${username}'s implementation`,
      stars: random(0, 500, i + 80),
      forks: random(0, 100, i + 90),
      lastUpdated: Date.now() - random(3600000, 2592000000, i + 100), // 1 hour to 30 days ago
      githubUrl: `https://github.com/${username}/${template.name}-${random(1, 999, i + 110)}`,
      language: template.tech[0],
      timeline: []
    };
    selectedProjects.push(project);
  }

  // Generate varied user stats
  const totalRepos = random(5, 50, 200);
  const followers = random(1, 1000, 210);
  const following = random(1, 500, 220);

  return {
    username,
    name: `${username.charAt(0).toUpperCase() + username.slice(1)} Developer (Demo)`,
    avatar: `https://github.com/identicons/${username}.png`,
    bio: `Demo user for ${username} - Passionate developer building amazing projects`,
    location: ['San Francisco, CA', 'New York, NY', 'London, UK', 'Berlin, Germany', 'Tokyo, Japan'][random(0, 4, 230)],
    company: ['GitHub', 'Microsoft', 'Google', 'Freelancer', 'Startup'][random(0, 4, 240)],
    publicRepos: totalRepos,
    followers: followers,
    following: following,
    githubUrl: `https://github.com/${username}`,
    projects: selectedProjects,
    lastUpdated: Date.now(),
    fetchedAt: Date.now(),
    realTimeData: false,
    isDemo: true
  };
};

// Rate limiting check
const checkRateLimit = async () => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`);
    if (response.ok) {
      const data = await response.json();
      return {
        remaining: data.rate.remaining,
        resetTime: new Date(data.rate.reset * 1000)
      };
    }
  } catch (error) {
    console.warn('Failed to check rate limit:', error);
    return null;
  }
};

const fetchGitHubUserData = async (username) => {
  try {
    console.log(`Fetching data for user: ${username}`);
    
    // Handle demo usernames
    const demoUsernames = ['demo-user', 'test-dev', 'sample-coder'];
    if (demoUsernames.includes(username.toLowerCase())) {
      console.log('Using demo data for demo username');
      return createDemoData(username);
    }
    
    // Check cache first
    const cacheKey = username.toLowerCase();
    const cached = userDataCache.get(cacheKey);
    if (cached && (Date.now() - cached.fetchedAt) < CACHE_DURATION) {
      console.log('Using cached data for:', username);
      return cached;
    }
    
    // Check rate limit before making requests
    const rateLimit = await checkRateLimit();
    if (rateLimit && rateLimit.remaining < 5) {
      console.warn('Rate limit low, using demo data');
      const resetTime = rateLimit.resetTime.toLocaleTimeString();
      throw new Error(`GitHub API rate limit exceeded. Limit resets at ${resetTime}. Using demo data for now.`);
    }
    
    // Fetch user profile
    const userResponse = await fetch(`${GITHUB_API_BASE}/users/${username}`);
    console.log(`User API response status: ${userResponse.status}`);
    
    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        throw new Error(`GitHub user "${username}" not found. Please check the username and try again.`);
      } else if (userResponse.status === 403) {
        // Check if it's rate limit or other forbidden access
        const rateLimitRemaining = userResponse.headers.get('X-RateLimit-Remaining');
        if (rateLimitRemaining === '0') {
          const resetTime = new Date(parseInt(userResponse.headers.get('X-RateLimit-Reset')) * 1000);
          throw new Error(`GitHub API rate limit exceeded. Limit resets at ${resetTime.toLocaleTimeString()}. Using demo data for now.`);
        } else {
          throw new Error('Access to this GitHub user is forbidden.');
        }
      } else {
        throw new Error(`Failed to fetch user data (Status: ${userResponse.status})`);
      }
    }
    const userData = await userResponse.json();

    // Fetch user's repositories
    const reposResponse = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=10`);
    console.log(`Repos API response status: ${reposResponse.status}`);
    
    if (!reposResponse.ok) {
      console.warn('Failed to fetch repositories, continuing with user data only');
    }
    const repos = reposResponse.ok ? await reposResponse.json() : [];

    // Transform GitHub data into FatiGat format with consistent simulated data
    const projects = repos.map((repo, index) => {
      // Create consistent simulated data based on repo characteristics
      const repoHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash);
      };
      
      const seed = repoHash(repo.name + repo.id);
      const seededRandom = (min, max, offset = 0) => {
        const x = Math.sin(seed + offset) * 10000;
        return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
      };

      // Base productivity on repo activity and popularity
      const activityMultiplier = Math.min(2, (repo.stargazers_count + repo.forks_count) / 50 + 0.5);
      const daysSinceUpdate = Math.max(1, (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      const recencyFactor = Math.max(0.3, Math.min(2, 30 / daysSinceUpdate));
      
      const baseTime = seededRandom(1800, 21600, 1); // 30min to 6 hours base
      const adjustedTime = Math.floor(baseTime * activityMultiplier * recencyFactor);
      
      return {
        id: index + 1,
        name: repo.name,
        tags: [repo.language || 'Unknown', ...(repo.topics || [])].filter(Boolean),
        timeSpent: adjustedTime,
        breaks: seededRandom(1, Math.max(2, Math.floor(adjustedTime / 3600) + 1), 2),
        sessionLengths: [
          seededRandom(1800, 5400, 3), // 30min - 1.5hr sessions
          seededRandom(1800, 5400, 4),
          seededRandom(1800, 5400, 5)
        ],
        description: repo.description || 'No description available',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        lastUpdated: new Date(repo.updated_at).getTime(),
        githubUrl: repo.html_url,
        language: repo.language,
        timeline: [] // Simplified for now
      };
    });

    console.log(`Successfully fetched data for ${userData.login} with ${projects.length} repositories`);

    const result = {
      username: userData.login,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      bio: userData.bio,
      location: userData.location,
      company: userData.company,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      githubUrl: userData.html_url,
      projects: projects,
      lastUpdated: Date.now(),
      fetchedAt: Date.now(),
      realTimeData: true
    };

    // Cache the result
    userDataCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    
    // If it's a rate limit error, return demo data
    if (error.message.includes('rate limit')) {
      console.log('Returning demo data due to rate limit');
      return createDemoData(username);
    }
    
    throw error;
  }
};

// Simple logo component  
// Alternative version - replace the FatiGatLogo component with:
const FatiGatLogo = ({ size = 64 }) => (
  <div 
    className="flex items-center justify-center"
    style={{ 
      width: size, 
      height: size,
      fontSize: `${size * 0.6}px`,
    }}
  >
    {/* Rotating between the three emojis */}
    <div className="animate-pulse">
      <span className="inline-block animate-bounce">⏰</span>
      <span className="inline-block animate-pulse opacity-70 ml-1">☕</span>
      <span className="inline-block animate-ping opacity-50">⏰</span>
    </div>
  </div>
);

// UI Components
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800/50 ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50";
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700",
    secondary: "bg-gray-700 text-white hover:bg-gray-600",
    ghost: "text-gray-400 hover:text-white hover:bg-gray-800"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input 
    className={`w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 ${className}`} 
    {...props} 
  />
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-700/50 text-gray-300",
    success: "bg-green-900/50 text-green-300",
    warning: "bg-yellow-900/50 text-yellow-300",
    error: "bg-red-900/50 text-red-300"
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Main App Component
const FatiGatApp = () => {
  const [searchInput, setSearchInput] = React.useState('');
  const [userData, setUserData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [selectedTags, setSelectedTags] = React.useState([]);

  // Calculate productivity score
  const calculateProductivityScore = (project) => {
    if (!project || !project.sessionLengths || project.sessionLengths.length === 0) {
      return 50; // Default score
    }
    const avgSessionLength = project.sessionLengths.reduce((a, b) => a + b, 0) / project.sessionLengths.length;
    const breakRatio = project.breaks / Math.max(1, project.timeSpent / 3600); // Prevent division by zero
    const score = Math.min(100, Math.max(0, (avgSessionLength / 3600) * 50 + (1 - breakRatio) * 50));
    return Math.round(score);
  };

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const searchUser = async () => {
  if (!searchInput.trim()) return;
  
  setLoading(true);
    setError(null);
    setUserData(null);
    setSelectedTags([]);
    
    try {
      const data = await fetchGitHubUserData(searchInput);
      setUserData(data);
      // Clear error if we got data (even demo data)
      if (data) {
        setError(null);
      }
    } catch (err) {
      // For rate limit errors, try to provide demo data
      if (err.message.includes('rate limit')) {
        console.log('Rate limit hit, providing demo data');
        const demoData = createDemoData(searchInput);
        setUserData(demoData);
        setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear user data
  const clearUserData = () => {
    setSearchInput('');
    setUserData(null);
    setError(null);
    setSelectedTags([]);
  };

  // Get all unique tags
  const getAllTags = (projects) => {
    const tags = new Set();
    projects.forEach(project => {
      project.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  // Filter projects by selected tags
  const filterProjects = (projects) => {
    if (selectedTags.length === 0) return projects;
    return projects.filter(project => 
      project.tags.some(tag => selectedTags.includes(tag))
    );
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        /* ...existing code... */

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}      
        @keyframes twinkle {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(0deg);
          }
          25% {
            opacity: 0;
            transform: scale(1.3) rotate(90deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.8) rotate(180deg);
          }
          75% {
            opacity: 0;
            transform: scale(1.1) rotate(270deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) rotate(360deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(30px) translateX(15px);
          }
          66% {
            transform: translateY(15px) translateX(10px);
          }
        }
        
        @keyframes drift {
          0% {
            transform: translateX(0px);
          }
          25% {
            transform: translateX(20px);
          }
          50% {
            transform: translateX(0px);
          }
          75% {
            transform: translateX(20px);
          }
          100% {
            transform: translateX(0px);
          }
        }
      `}</style>
      
      {/* Twinkling Emojis Background */}
      <TwinklingEmojisContainer />
      
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-blue-900/10"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Main Logo and Title */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/20">
                <FatiGatLogo size={64} color="#ffffff" />
              </div>
              <div className="text-center">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  FatiGat
                </h1>
                <p className="text-xl text-gray-400 font-medium">"Even cats nap between curiosity."</p>
              </div>
            </div>
            
            {/* User Info and Actions */}
            {userData && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={userData.avatar} 
                    alt={userData.name} 
                    className="w-10 h-10 rounded-full border-2 border-purple-400"
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-300">{userData.name}</p>
                    <p className="text-xs text-gray-500">@{userData.username}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  onClick={clearUserData}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Username Search */}
        <Card className="p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold">Enter GitHub Username</h3>
          </div>
          
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="e.g., octocat, torvalds, gaearon..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUser()}
              />
            </div>
            <Button 
              onClick={searchUser}
              disabled={!searchInput.trim() || loading}
            >
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </div>
         
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading user data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !userData && (
          <Card className="p-8 text-center mb-8">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-lg font-medium mb-2">Error Loading Data</p>
              <p className="text-sm text-gray-400 mb-4">{error}</p>
            </div>
          </Card>
        )}

        {/* Demo Mode Banner */}
        {userData && userData.isDemo && (
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-yellow-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-yellow-300 font-medium">Demo Mode Active</p>
                <p className="text-yellow-400/80 text-sm">
                  GitHub API rate limit reached. Showing demo data. Real data will return when the rate limit resets.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rate Limit Info Banner */}
        {error && error.includes('rate limit') && (
          <div className="mb-6 p-4 bg-orange-900/30 border border-orange-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-orange-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-orange-300 font-medium">GitHub API Rate Limit</p>
                <p className="text-orange-400/80 text-sm">
                  Too many requests to GitHub API. Try demo usernames like "demo-user" or wait for the limit to reset.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* User Data Display */}
        {userData && !loading && (
          <div className="space-y-8">
            {/* User Profile */}
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <img 
                  src={userData.avatar} 
                  alt={userData.name} 
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  <p className="text-gray-400">@{userData.username}</p>
                  {userData.bio && <p className="text-sm text-gray-300 mt-2">{userData.bio}</p>}
                  {userData.location && <p className="text-sm text-gray-400 mt-1">📍 {userData.location}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-purple-400">{userData.publicRepos}</p>
                  <p className="text-sm text-gray-400">Repositories</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{userData.followers}</p>
                  <p className="text-sm text-gray-400">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{userData.following}</p>
                  <p className="text-sm text-gray-400">Following</p>
                </div>
              </div>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {userData.projects.length > 0 ? Math.round(userData.projects.reduce((acc, p) => acc + calculateProductivityScore(p), 0) / userData.projects.length) : 0}
                  </div>
                  <div className="text-sm text-gray-400">Avg Productivity Score</div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {formatTime(userData.projects.reduce((acc, p) => acc + p.timeSpent, 0))}
                  </div>
                  <div className="text-sm text-gray-400">Total Time Spent</div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {userData.projects.reduce((acc, p) => acc + p.breaks, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Breaks</div>
                </div>
              </Card>
            </div>

            {/* Tag Filter */}
            {userData.projects.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Filter by Technology</h3>
                <div className="flex flex-wrap gap-2">
                  {getAllTags(userData.projects).map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "success" : "default"}
                      className={`cursor-pointer transition-all ${
                        selectedTags.includes(tag) 
                          ? 'bg-purple-900/50 text-purple-300' 
                          : 'hover:bg-gray-600/50'
                      }`}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {selectedTags.length > 0 && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedTags([])}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Recent Repositories</h3>
              
              {userData.projects.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">No Public Repositories</p>
                    <p className="text-sm mt-2">This user doesn't have any public repositories yet.</p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filterProjects(userData.projects).map(project => (
                    <Card key={project.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-purple-400">{project.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Productivity</div>
                          <div className="text-2xl font-bold text-green-400">
                            {calculateProductivityScore(project)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Time Spent</span>
                          <span className="text-sm font-medium">{formatTime(project.timeSpent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Breaks</span>
                          <span className="text-sm font-medium">{project.breaks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Stars</span>
                          <span className="text-sm font-medium">⭐ {project.stars}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tags.map(tag => (
                          <Badge key={tag} variant="default">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <a 
                          href={project.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          View on GitHub →
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FatiGatApp;
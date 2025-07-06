import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3004;

// Enable CORS and JSON parsing
app.use(cors({
  origin: [
    'http://localhost:3003', 
    'http://localhost:3000', 
    'http://localhost:5173',
    'https://cuddly-disco-9xwgwqpx6v6c75w-3000.app.github.dev',
    /https:\/\/.*\.app\.github\.dev$/
  ],
  credentials: true
}));
app.use(express.json());

// In-memory data store (simulating a database with real-time updates)
let userData = {
  "sindhu-m-valerie": {
    username: "sindhu-m-valerie",
    projects: [
      {
        id: 1,
        name: "FatiGat Development",
        tags: ["Development", "React"],
        timeSpent: 14400, // 4 hours
        breaks: 3,
        sessionLengths: [2700, 3600, 8100],
        timeline: [
          { type: 'work', start: Date.now() - 14400000, end: Date.now() - 12000000 },
          { type: 'break', start: Date.now() - 12000000, end: Date.now() - 11700000 },
          { type: 'work', start: Date.now() - 11700000, end: Date.now() - 8100000 }
        ]
      },
      {
        id: 2,
        name: "UI/UX Design",
        tags: ["Design", "UI"],
        timeSpent: 10800, // 3 hours
        breaks: 4,
        sessionLengths: [1800, 2700, 6300],
        timeline: []
      }
    ],
    lastUpdated: Date.now()
  },
  "demo-user": {
    username: "demo-user",
    projects: [
      {
        id: 1,
        name: "Project Alpha",
        tags: ["Development"],
        timeSpent: 18000, // 5 hours
        breaks: 5,
        sessionLengths: [3600, 3600, 3600, 3600, 3600],
        timeline: []
      },
      {
        id: 2,
        name: "Meeting Notes",
        tags: ["Documentation", "Meeting"],
        timeSpent: 5400, // 1.5 hours
        breaks: 1,
        sessionLengths: [5400],
        timeline: []
      }
    ],
    lastUpdated: Date.now()
  },
  "test-user": {
    username: "test-user",
    projects: [
      {
        id: 1,
        name: "Bug Fixes",
        tags: ["Bug Fix", "Development"],
        timeSpent: 12600, // 3.5 hours
        breaks: 3,
        sessionLengths: [4200, 4200, 4200],
        timeline: []
      }
    ],
    lastUpdated: Date.now()
  }
};

// Simulate real-time data changes
function simulateRealTimeUpdates() {
  setInterval(() => {
    // Randomly update data for existing users
    Object.keys(userData).forEach(username => {
      const user = userData[username];
      
      // Randomly update one of the user's projects
      if (user.projects.length > 0) {
        const randomProject = user.projects[Math.floor(Math.random() * user.projects.length)];
        
        // Simulate time progression (add 1-5 minutes randomly)
        const timeIncrease = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
        randomProject.timeSpent += timeIncrease;
        
        // Occasionally add a break
        if (Math.random() < 0.3) {
          randomProject.breaks += 1;
        }
        
        // Update session lengths
        if (randomProject.sessionLengths) {
          const lastSession = randomProject.sessionLengths[randomProject.sessionLengths.length - 1] || 0;
          randomProject.sessionLengths[randomProject.sessionLengths.length - 1] = lastSession + timeIncrease;
        }
        
        // Update timeline with new work session
        if (randomProject.timeline) {
          const now = Date.now();
          randomProject.timeline.push({
            type: 'work',
            start: now - timeIncrease * 1000,
            end: now
          });
        }
      }
      
      user.lastUpdated = Date.now();
    });
    
    console.log(`[${new Date().toISOString()}] Real-time data updated for all users`);
  }, 10000); // Update every 10 seconds for demo purposes
}

// Start real-time updates
simulateRealTimeUpdates();

// API Routes

// Get user data
app.get('/api/userdata', (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  const user = userData[username.toLowerCase()];
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Add real-time timestamp
  const responseData = {
    ...user,
    fetchedAt: Date.now(),
    realTimeData: true
  };
  
  console.log(`[${new Date().toISOString()}] Fetched data for user: ${username}`);
  res.json(responseData);
});

// Update user data (for syncing local data)
app.post('/api/userdata', (req, res) => {
  const { username, projects } = req.body;
  
  if (!username || !projects) {
    return res.status(400).json({ error: 'Username and projects are required' });
  }
  
  // Update or create user data
  userData[username.toLowerCase()] = {
    username: username,
    projects: projects,
    lastUpdated: Date.now()
  };
  
  console.log(`[${new Date().toISOString()}] Updated data for user: ${username}`);
  res.json({ success: true, message: 'Data updated successfully' });
});

// Get all users (for debugging)
app.get('/api/users', (req, res) => {
  const userList = Object.keys(userData).map(username => ({
    username: userData[username].username,
    projectCount: userData[username].projects.length,
    lastUpdated: userData[username].lastUpdated
  }));
  
  res.json(userList);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: Date.now(),
    activeUsers: Object.keys(userData).length,
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FatiGat Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Real-time data updates enabled`);
  console.log(`👥 Sample users: ${Object.keys(userData).join(', ')}`);
  console.log(`🔗 API endpoints:`);
  console.log(`   GET  /api/userdata?username=<username>`);
  console.log(`   POST /api/userdata`);
  console.log(`   GET  /api/users`);
  console.log(`   GET  /api/health`);
});

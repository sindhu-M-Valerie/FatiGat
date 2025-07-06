import * as React from "react";
import { createRoot } from "react-dom/client";
import * as d3 from "d3";
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
  useKV
} from "./components.jsx";
import {
  Timer,
  Coffee,
  Brain,
  Plus,
  Lightning,
  Gauge,
  Clock,
  Tag,
  FunnelSimple,
  MagnifyingGlass,
  Activity,
  Heart,
  Moon,
  Sun
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
  if (!project || !project.timeSpent) return 0;
  
  const timeSpent = project.timeSpent || 0;
  const breaks = project.breaks || 0;
  const sessionLengths = project.sessionLengths || [];
  
  const breakRatio = breaks / Math.max(1, timeSpent / 2700);
  const consistencyScore = sessionLengths.length > 0 
    ? sessionLengths.reduce((acc, length) => 
        acc + (length > 1800 && length < 3600 ? 1 : 0), 0) / sessionLengths.length
    : 0;
  
  return Math.round((0.5 * Math.min(breakRatio, 1) + 0.5 * consistencyScore) * 100);
};

// Generate personalized suggestions based on work patterns
const generateSuggestions = (project) => {
  if (!project) return ["Your work patterns look healthy! Keep it up!"];
  
  const suggestions = [];
  const timeSpent = project.timeSpent || 0;
  const breaks = project.breaks || 0;
  const sessionLengths = project.sessionLengths || [];
  
  const avgSessionLength = sessionLengths.length > 0
    ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length
    : 0;
    
  if (breaks / Math.max(1, timeSpent / 2700) < 0.8) {
    suggestions.push("Consider taking more regular breaks to maintain productivity");
  }
  
  if (avgSessionLength > 3600) {
    suggestions.push("Your sessions are quite long. Try breaking them into smaller chunks");
  }
  
  if (timeSpent > 14400 && breaks < 4) {
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

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const x = d3
      .scaleTime()
      .domain([today, d3.timeDay.offset(today, 1)])
      .range([margin.left, width - margin.right]);

    const xAxis = d3
      .axisBottom(x)
      .ticks(8)
      .tickFormat(d3.timeFormat("%H:%M"));

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    // Work periods
    svg
      .selectAll("rect.work")
      .data(project.timeline.filter((t) => t.type === "work"))
      .enter()
      .append("rect")
      .attr("class", "work")
      .attr("x", (d) => x(new Date(d.start)))
      .attr("y", margin.top)
      .attr("width", (d) => Math.max(1, x(new Date(d.end)) - x(new Date(d.start))))
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "#4f82f6")
      .attr("opacity", 0.6);

    // Break periods
    svg
      .selectAll("rect.break")
      .data(project.timeline.filter((t) => t.type === "break"))
      .enter()
      .append("rect")
      .attr("class", "break")
      .attr("x", (d) => x(new Date(d.start)))
      .attr("y", margin.top)
      .attr("width", (d) => Math.max(1, x(new Date(d.end)) - x(new Date(d.start))))
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "#fb923c")
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
  const [breakDue, setBreakDue] = React.useState(false);
  const [sessionStart, setSessionStart] = React.useState(null);
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectTags, setNewProjectTags] = React.useState([]);
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [darkMode, setDarkMode] = React.useState(false);

  // Dark mode implementation
  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // Timer logic - simplified to prevent infinite loops
  React.useEffect(() => {
    let interval;
    
    if (activeProject) {
      if (!sessionStart) {
        const now = Date.now();
        setSessionStart(now);
        
        // Add new work session to timeline
        setProjects((prev) =>
          prev.map((p) =>
            p.id === activeProject.id
              ? {
                  ...p,
                  timeline: [
                    ...(p.timeline || []),
                    {
                      type: "work",
                      start: now,
                      end: now
                    }
                  ]
                }
              : p
          )
        );
      }
      
      // Update time every second
      interval = setInterval(() => {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id === activeProject.id) {
              const newTimeSpent = (p.timeSpent || 0) + 1;
              
              // Check for break reminder every 45 minutes (2700 seconds)
              if (newTimeSpent % 2700 === 0 && newTimeSpent > 0) {
                setBreakDue(true);
              }
              
              return { ...p, timeSpent: newTimeSpent };
            }
            return p;
          })
        );
      }, 1000);
    } else if (sessionStart) {
      // Stop session
      const now = Date.now();
      const sessionLength = (now - sessionStart) / 1000;
      
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === activeProject?.id) {
            const timeline = p.timeline || [];
            const updatedTimeline = timeline.map((t, i) =>
              i === timeline.length - 1 && t.type === "work"
                ? { ...t, end: now }
                : t
            );
            
            return {
              ...p,
              sessionLengths: [...(p.sessionLengths || []), sessionLength],
              timeline: updatedTimeline
            };
          }
          return p;
        })
      );
      
      setSessionStart(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeProject, sessionStart, projects]);

  const addProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now(),
        name: newProjectName,
        tags: newProjectTags,
        timeSpent: 0,
        breaks: 0,
        sessionLengths: [],
        timeline: []
      };
      
      setProjects((prev) => [...prev, newProject]);
      setNewProjectName("");
      setNewProjectTags([]);
      setShowNewProjectDialog(false);
    }
  };

  const takeBreak = (projectId) => {
    const now = Date.now();
    
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const timeline = p.timeline || [];
          
          // End current work session if active
          const updatedTimeline = timeline.map((t, idx) =>
            idx === timeline.length - 1 && t.type === "work" && !t.end
              ? { ...t, end: now }
              : t
          );
          
          // Add break session
          updatedTimeline.push({
            type: "break",
            start: now,
            end: now + 5 * 60 * 1000 // 5 minutes
          });
          
          return {
            ...p,
            breaks: (p.breaks || 0) + 1,
            timeline: updatedTimeline
          };
        }
        return p;
      })
    );
    
    setBreakDue(false);
  };

  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      const matchesTags = selectedTags.length === 0 || 
        (project.tags && project.tags.some((tag) => selectedTags.includes(tag)));
      
      const matchesSearch = searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.tags && project.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      
      return matchesTags && matchesSearch;
    });
  }, [projects, selectedTags, searchQuery]);

  return (
    <SparkApp>
      <PageContainer maxWidth="large">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 -mx-4 px-4 py-4 mb-8">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Activity className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    FatiGat
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Productivity & Wellness Tracker
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800"
                  />
                </div>
              </div>

              <Button variant="plain" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>

              <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
                <DialogTrigger asChild>
                  <Button icon={<Plus />} variant="primary">
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                    <DialogDescription>
                      Start tracking a new project's time and health metrics
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Project name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Project Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PROJECT_TAGS.map((tag) => (
                          <Button
                            key={tag}
                            variant={
                              newProjectTags.includes(tag)
                                ? "primary"
                                : "secondary"
                            }
                            size="small"
                            onClick={() => {
                              setNewProjectTags((prev) =>
                                prev.includes(tag)
                                  ? prev.filter((t) => t !== tag)
                                  : [...prev, tag]
                              );
                            }}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full"
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

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Timer className="text-blue-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Active Projects
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {projects.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="text-green-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Time Today
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.floor(
                    projects.reduce((acc, p) => acc + (p.timeSpent || 0), 0) / 3600
                  )}h{" "}
                  {Math.floor(
                    (projects.reduce((acc, p) => acc + (p.timeSpent || 0), 0) % 3600) / 60
                  )}m
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Coffee className="text-orange-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Breaks Taken
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {projects.reduce((acc, p) => acc + (p.breaks || 0), 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gauge className="text-purple-600" size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Avg Productivity
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {projects.length > 0
                    ? Math.round(
                        projects.reduce(
                          (acc, p) => acc + calculateProductivityScore(p),
                          0
                        ) / projects.length
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FunnelSimple className="text-teal-600" />
            <span className="font-medium">Filter by tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROJECT_TAGS.map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "primary" : "secondary"}
                size="small"
                onClick={() => {
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  );
                }}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="grid gap-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {searchQuery ? (
                  <MagnifyingGlass className="text-gray-400" size={24} />
                ) : (
                  <Timer className="text-gray-400" size={24} />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchQuery
                  ? `No projects match "${searchQuery}". Try adjusting your search terms.`
                  : "Create your first project to start tracking your productivity and wellness."}
              </p>
              {!searchQuery && (
                <Button
                  icon={<Plus />}
                  variant="primary"
                  onClick={() => setShowNewProjectDialog(true)}
                >
                  Create Your First Project
                </Button>
              )}
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id}>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{project.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                          >
                            <Tag size={12} />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Time: {Math.floor((project.timeSpent || 0) / 3600)}h{" "}
                        {Math.floor(((project.timeSpent || 0) % 3600) / 60)}m
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        icon={<Timer />}
                        variant={
                          activeProject?.id === project.id
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() =>
                          setActiveProject(
                            activeProject?.id === project.id ? null : project
                          )
                        }
                      >
                        {activeProject?.id === project.id ? "Stop" : "Start"}
                      </Button>
                      <Button
                        icon={<Coffee />}
                        variant="plain"
                        onClick={() => takeBreak(project.id)}
                      >
                        Break
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Gauge className="text-teal-600" />
                      <span>
                        Productivity Score: {calculateProductivityScore(project)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coffee className="text-teal-600" />
                      <span>Breaks: {project.breaks || 0}</span>
                    </div>
                  </div>

                  {project.timeline && project.timeline.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Clock className="text-teal-600" />
                        Daily Timeline
                      </h4>
                      <Timeline project={project} />
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lightning className="text-teal-600" />
                      Suggestions
                    </h4>
                    <ul className="text-sm space-y-1">
                      {generateSuggestions(project).map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Break Reminder Dialog */}
        <Dialog open={breakDue} onOpenChange={setBreakDue}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Time for a Break!</DialogTitle>
              <DialogDescription>
                You've been working for 45 minutes. Taking regular breaks helps
                maintain productivity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p>Suggested activities:</p>
              <ul className="list-disc pl-6">
                <li>Take a 5-minute walk</li>
                <li>Do some quick stretches</li>
                <li>Rest your eyes by looking at something 20 feet away</li>
                <li>Get a glass of water</li>
              </ul>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setBreakDue(false);
                  if (activeProject) {
                    takeBreak(activeProject.id);
                  }
                }}
              >
                Start Break
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </SparkApp>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

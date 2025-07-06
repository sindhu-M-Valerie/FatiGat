# FatiGat

This app is called Fatigue Mirror.

It is a productivity and wellbeing tracker focused on project work sessions. Here’s a summary of what it does:

**Project-Based Time Tracking:**

Users can create and manage multiple projects, each with customizable tags (e.g., Development, Design, Bug Fix).

**Session Logging:**
You can start and stop timers for focused work sessions on each project. The app records session lengths and total time spent.

**Break Reminders:**
After 45 minutes (2700 seconds) of continuous work, the app prompts you to take a break with a dialog suggesting healthy break activities.

**Break and Session Analytics:**
Tracks number of breaks, session consistency, and provides a “productivity score” for each project based on your work/break patterns.

**Timeline Visualization:**
Each project has a visual D3.js-rendered timeline showing periods of work and breaks across the day.

**Personalized Suggestions:**
For each project, the app analyzes your recent patterns and suggests ways to improve work habits (e.g., take more breaks, split up long sessions).

**Filtering:**
Projects can be filtered by tags for easier management.

**Persistent Storage:**
Projects and session data are saved using the useKV hook (key-value storage), so your information persists between sessions.

**In short:**
Fatigue Mirror helps you track, visualize, and improve your work/break habits across projects, making it easier to balance productivity and wellbeing

<img width="383" alt="Screenshot 2025-07-04 at 11 19 19 PM" src="https://github.com/user-attachments/assets/a4d8da44-9ae4-44b6-9e48-3136687cdf10" />

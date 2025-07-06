import * as React from "react";
import { createRoot } from "react-dom/client";
import { 
  SparkApp, 
  PageContainer,
  Card,
  Button
} from "./components.jsx";
import "./index.css";

function App() {
  return (
    <SparkApp>
      <PageContainer>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900">FatiGat - Productivity Tracker</h1>
          <p className="text-gray-600 mb-4">If you can see this, the app is working!</p>
          <Card>
            <div className="p-4">
              <p>This is a card component</p>
              <Button variant="primary">Test Button</Button>
            </div>
          </Card>
        </div>
      </PageContainer>
    </SparkApp>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

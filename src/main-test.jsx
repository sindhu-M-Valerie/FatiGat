import * as React from "react";
import { createRoot } from "react-dom/client";
import { Activity, Timer } from "@phosphor-icons/react";
import { SparkApp, PageContainer, Button } from "./components.jsx";

console.log("Main.jsx loaded with components");

function App() {
  console.log("App component rendering");
  
  return (
    <SparkApp>
      <PageContainer>
        <div style={{ padding: '20px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Activity size={32} />
            FatiGat - Components Test
          </h1>
          <p style={{ marginBottom: '20px' }}>Testing components integration:</p>
          <div style={{ marginBottom: '20px' }}>
            <Button variant="primary" icon={<Timer />}>
              Test Button
            </Button>
          </div>
          <p>If you can see this styled content, all basic components are working!</p>
        </div>
      </PageContainer>
    </SparkApp>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Root element not found!");
}

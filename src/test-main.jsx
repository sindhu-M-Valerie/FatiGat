import * as React from "react";
import { createRoot } from "react-dom/client";

function TestApp() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Test App</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<TestApp />);

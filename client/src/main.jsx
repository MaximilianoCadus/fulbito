import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Development utilities
if (import.meta.env.DEV) {
  import("./utils/devUtils.js");
  import("./utils/mobileTestUtils.js");
  import("./utils/mobileFieldTests.js");
  import("./utils/visualConsistencyTests.js");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Mount the React app into the #root div defined in index.html.
// StrictMode intentionally renders components twice in development to surface
// side-effects from impure render functions — has no effect in production.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

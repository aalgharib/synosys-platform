import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./tailwind.generated.css";
import {
  applyTheme,
  getStoredTheme,
  type ThemeMode,
} from "./lib/theme";
import "./index.css";

const initialTheme = (getStoredTheme() ?? "system") as ThemeMode;
applyTheme(initialTheme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

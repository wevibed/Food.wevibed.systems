import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./base.css";
import "./theme.css";
import site from "./data/site.json";
import { applyBrand } from "./lib/theme";
import App from "./App.jsx";

applyBrand(site);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

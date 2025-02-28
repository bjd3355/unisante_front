// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css"; // Fichier CSS global si nécessaire
import "./styles/output.css"; // Fichier CSS global si nécessaire

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);

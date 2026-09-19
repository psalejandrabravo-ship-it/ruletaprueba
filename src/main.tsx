import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import "@/styles.css";

const root = document.getElementById("app");

if (!root) {
  throw new Error("No se encontró el contenedor #app");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

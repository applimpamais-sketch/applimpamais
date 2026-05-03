import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Registrar SW apenas na área admin
if (window.location.pathname.startsWith('/admin')) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}

createRoot(document.getElementById("root")!).render(<App />);

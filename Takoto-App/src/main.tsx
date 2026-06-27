import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { GlobalProvider } from "@/contexts/GlobalContext";
import { GoogleAuthProvider } from "@/contexts/GoogleAuthContext";
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GoogleAuthProvider>
      <GlobalProvider>
        <App />
        <Toaster />
      </GlobalProvider>
    </GoogleAuthProvider>
  </React.StrictMode>
);

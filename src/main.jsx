import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import AppKitProvider from "./config/wagmi.jsx";
import { UserContextProvider } from "./context/UserContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppKitProvider>
      <UserContextProvider>
      <App />
      </UserContextProvider>
    </AppKitProvider>
  </React.StrictMode>
);

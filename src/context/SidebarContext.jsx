import React, { createContext, useState } from "react";

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState("w-[268px]");

  const toggleSidebar = () => {
    setSidebarWidth(sidebarWidth === "w-24" ? "w-[268px]" : "w-24");
  };

  return (
    <SidebarContext.Provider value={{ sidebarWidth, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

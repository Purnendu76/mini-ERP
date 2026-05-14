import React, { createContext, useContext } from "react";
import type { AppRoute } from "@/routes/utils";

const RouteContext = createContext<AppRoute[]>([]);

export const RouteProvider = ({ children, routes }: { children: React.ReactNode; routes: AppRoute[] }) => {
  return (
    <RouteContext.Provider value={routes}>
      {children}
    </RouteContext.Provider>
  );
};

export const useAppRoutes = () => useContext(RouteContext);

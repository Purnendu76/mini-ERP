import { RouterProvider } from "react-router-dom";
import { appRouter, appRoutes } from "./routes";
import { RouteProvider } from "./context/RouteContext";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="erp-theme">
      <RouteProvider routes={appRoutes}>
        <RouterProvider router={appRouter} />
         <Toaster richColors position="top-right" />
      </RouteProvider>
    </ThemeProvider>
  );
};

export default App;

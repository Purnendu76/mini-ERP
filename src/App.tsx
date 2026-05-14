import { RouterProvider } from "react-router-dom";
import { appRouter, appRoutes } from "./routes";
import { RouteProvider } from "./context/RouteContext";
import { Toaster } from "./components/ui/sonner";

const App = () => {
  return (
    <RouteProvider routes={appRoutes}>
      <RouterProvider router={appRouter} />
       <Toaster richColors position="top-right" />
    </RouteProvider>
  );
};

export default App;

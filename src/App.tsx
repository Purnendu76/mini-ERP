import { RouterProvider } from "react-router-dom";
import { appRouter, appRoutes } from "./routes";
import { RouteProvider } from "./context/RouteContext";

const App = () => {
  return (
    <RouteProvider routes={appRoutes}>
      <RouterProvider router={appRouter} />
    </RouteProvider>
  );
};

export default App;

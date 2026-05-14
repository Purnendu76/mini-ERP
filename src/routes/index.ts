import { createHashRouter } from "react-router-dom";
import { generateRouterConfig } from "./utils";
import { appRoutes } from "./config";

export { appRoutes };

const routerConfig = generateRouterConfig(appRoutes);

export const appRouter = createHashRouter(routerConfig);

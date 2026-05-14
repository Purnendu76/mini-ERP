import { adminRoutes } from "./route.admin";
import { managerRoutes } from "./route.managers";
import { staffRoutes } from "./route.staff";
import { defaultRoutes } from "./route.default";

export const appRoutes = [
  ...defaultRoutes,
  adminRoutes,
  managerRoutes,
  staffRoutes,
];

import type { ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import type { TablerIcon } from "@tabler/icons-react";

export type UserRole = "Admin" | "Manager" | "Staff";

export type AppRoute = {
  label?: string;
  icon?: TablerIcon | string;
  path: string;
  element: ReactNode;
  children?: AppRoute[];
  hidden?: boolean;
  permissions?: UserRole[];
};

export type NavbarMenu = {
  label: string;
  icon?: TablerIcon | string;
  initiallyOpened?: boolean;
  link?: string;
  submenus?: NavbarSubmenu[];
};

export type NavbarSubmenu = {
  label: string;
  link: string;
};

export function generateRouterConfig(appRoutes: AppRoute[]): RouteObject[] {
  const routes: RouteObject[] = [];

  for (const appRoute of appRoutes) {
    const route: RouteObject = {
      path: normalizePath(appRoute.path),
      element: appRoute.element,
      children: [],
    };

    if (appRoute.children) {
      route.children = generateRouterConfig(appRoute.children);
    }

    routes.push(route);
  }

  return routes;
}

export function generateNavbarMenu(
  appRoutes: AppRoute[],
  appUrl: string,
  userRole?: UserRole
): NavbarMenu[] {
  const navbarMenu: NavbarMenu[] = [];

  appRoutes.forEach((route) => {
    // Skip hidden routes or those without labels
    if (route.hidden || !route.label) return;

    // Check permissions
    if (route.permissions && route.permissions.length > 0) {
      if (!userRole || !route.permissions.includes(userRole)) return;
    }

    const menu: NavbarMenu = {
      label: route.label,
      icon: route.icon,
      link: createLink(route.path),
    };

    if (route.children && route.children.length > 0) {
      menu.submenus = route.children
        .filter((child) => !child.hidden && child.label)
        .map((child) => ({
          label: child.label!,
          link: createLink(route.path, child.path),
        }));
      
      // If it has submenus, the main link might not be needed or could be the first child
      if (menu.submenus.length > 0) {
        delete menu.link;
      }
    }

    navbarMenu.push(menu);
  });

  return navbarMenu;
}

export function normalizePath(path: string | undefined | null): string {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
}

export function createLink(...paths: string[]): string {
  const combined = paths.map(normalizePath).filter(Boolean).join("/");
  return `/${combined}`;
}
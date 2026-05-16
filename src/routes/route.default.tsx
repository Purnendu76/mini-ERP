import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { SuspenseLoader } from "@/components/loaders/SuspenseLoader";
import type { AppRoute } from "./utils";

// Lazy-loaded components
const Login = lazy(() => import("@/pages/Default/Login"));
const NotFound = lazy(() => import("@/pages/Default/Notfoundpages"));
export const defaultRoutes: AppRoute[] = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
];

import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { SuspenseLoader } from "@/components/loaders/SuspenseLoader";
import GuestRoute from "@/components/auth/GuestRoute";
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
      <GuestRoute>
        <Suspense fallback={<SuspenseLoader />}>
          <Login />
        </Suspense>
      </GuestRoute>
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

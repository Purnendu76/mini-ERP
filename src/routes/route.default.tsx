import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { SuspenseLoader } from "@/components/loaders/SuspenseLoader";
import type { AppRoute } from "./utils";

// Lazy-loaded components
const Login = lazy(() => import("@/pages/Default/Login"));
const Register = lazy(() => import("@/pages/Default/Regester"));
const NotFound = lazy(() => import("@/pages/Default/Notfoundpages"));
const SettingPage = lazy(() => import("@/pages/Default/SettingPage"));

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
    path:"/setting",
    element:(
      <Suspense fallback={<SuspenseLoader />}>
        <SettingPage />
      </Suspense>
    )
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <Register />
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

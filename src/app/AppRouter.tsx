/*---------------------------------------
NOTE: MUI ROUTER
Router made to be used with MUI.
---------------------------------------*/

import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { FirebaseAuthProvider } from "./auth";
import { CalendarView } from "./components/calendar";
import { DashboardView } from "./components/dashboard";
import { SettingsView } from "./components/settings";
import { ToolView } from "./components/tool/tool";
import Home from "./pages/home";
import Login from "./pages/login";
import Layout from "./pages/layout";
import ErrorPage from "./pages/errorPage";
import Signup from "./pages/signup";
import SignIn from "./pages/signIn";
import { OnBoarding } from "./pages/onBoarding";



const router = createBrowserRouter([
  {
    path: "/",
    // element: <Home />,
    element: <ToolView />,
  },
  {
    path: "/onboarding",
    // element: <Home />,
    element: <OnBoarding/>,
  },
  {
    path: "/login",
    element: (
      <FirebaseAuthProvider>
        <Login />
      </FirebaseAuthProvider>
    ),
  },
  {
    path: "/signup",
    element: (
      <FirebaseAuthProvider>
        <Signup />
      </FirebaseAuthProvider>
    ),
  },
  {
    path: "/signIn",
    element: (
      <FirebaseAuthProvider>
        <SignIn />
      </FirebaseAuthProvider>
    ),
  },
  {
    path: "/mystudio",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "dashboard",
        element: <DashboardView />,
      },
     
      {
        path: "tool",
        element: <ToolView />,
      },
      {
        path: "calendar",
        element: <CalendarView />,
      },
      {
        path: "settings",
        element: <SettingsView />,
      },
    ],
  },
]);

export default router;

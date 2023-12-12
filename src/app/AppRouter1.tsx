/*---------------------------------------
NOTE: CHAKRA-UI ROUTER
Router made to be used with Chakra UI.
---------------------------------------*/

import React from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { ROUTE_PATHS } from "../constants";

import { lazyWithSuspense } from "./components/lazycomponent";
import { FirebaseAuthProvider } from "./auth";
import PermissionGuard from "./routes/permissionGuard";
import { getPermissionsDictionary } from "./routes/permissionsProvider";
import { PaymentPlans } from "./pages/paymentPlans";
import { RoomViewSettings } from "./pages/settings/roomview";
import { Webooks } from "./pages/settings/webhooks";

const CalendarView = lazyWithSuspense(() => import("./components/calendar"));
const DashboardView = lazyWithSuspense(() => import("./components/dashboard"));
const SettingsView = lazyWithSuspense(() => import("./components/settings"));
const ToolView = lazyWithSuspense(() => import("./components/toolNew"));
const ResetPassword = lazyWithSuspense(
  () => import("./components/resetPassword")
);

const Home = lazyWithSuspense(() => import("./pages/home"));
const Login = lazyWithSuspense(() => import("./pages/login"));
const Layout = lazyWithSuspense(() => import("./pages/layout"));
const ErrorPage = lazyWithSuspense(() => import("./pages/errorPage"));

// Settings Components
const AccountManagement = lazyWithSuspense(
  () => import("./pages/settings/accountManagement")
);
const OrganizationManagement = lazyWithSuspense(
  () => import("./pages/settings/organizationManagement")
);
const ScreenSettings = lazyWithSuspense(
  () => import("./pages/settings/screenSettings")
);
const UserManagement = lazyWithSuspense(
  () => import("./pages/settings/userManagement")
);
const CustomerManagement = lazyWithSuspense(
  () => import("./pages/settings/customerManagement")
);
const PackageManagement = lazyWithSuspense(() => import("./pages/settings/packageManagement"));
const Products = lazyWithSuspense(() => import("./pages/settings/products"));
const Contacts = lazyWithSuspense(() => import("./pages/contacts"));
const SignUp = lazyWithSuspense(() => import("./pages/signup"));
const SignIn = lazyWithSuspense(() => import("./pages/signIn"));
const OnBoarding = lazyWithSuspense(() => import("./pages/onBoarding"));
const IntegrationApi = lazyWithSuspense(() => import("./pages/integrationApi"));
const Sales = lazyWithSuspense(() => import("./pages/sales"));
const ClientView = lazyWithSuspense(() => import("./pages/clientView"));
const ClientViewOrder = lazyWithSuspense(
  () => import("./pages/clientView/orders")
);
const GalleryImagesView = lazyWithSuspense(
  () => import("./pages/clientView/orders/galleryView")
);
const TermsConditions = lazyWithSuspense(
  () => import("./pages/settings/termsConditions")
);
const CustomForm = lazyWithSuspense(() => import("./pages/customForm"));
const EmployeeOnboarding = lazyWithSuspense(
  () => import("./pages/onBoarding/employeeOnboarding")
);
const ProductionPage = lazyWithSuspense(() => import("./pages/productionPage"));
const Notifications = lazyWithSuspense(() => import("./pages/notifications"));
const PaymentManagement = lazyWithSuspense(
  () => import("./pages/settings/paymentManagement")
);

export default function AppRouter() {
  const permissionsDictionary = getPermissionsDictionary();
  const router1 = createBrowserRouter([
    {
      path: "*",
      element: <Home />,
    },
    {
      path: ROUTE_PATHS.HOME,
      element: <Home />,
    },
    {
      path: ROUTE_PATHS.CUSTOM_FORM,
      element: <CustomForm />,
    },
    {
      path: ROUTE_PATHS.IMAGE_GALLERY,
      element: <GalleryImagesView />,
    },
    {
      path: ROUTE_PATHS.PAYMENT_PLANS,
      element: <PaymentPlans />,
    },
    {
      path: ROUTE_PATHS.ONBOARDING,
      element: (
        <FirebaseAuthProvider>
          <OnBoarding />
        </FirebaseAuthProvider>
      ),
    },
    {
      path: ROUTE_PATHS.EMPLOYEE_ONBOARDING,
      element: (
        <FirebaseAuthProvider>
          <EmployeeOnboarding />
        </FirebaseAuthProvider>
      ),
    },
    {
      path: ROUTE_PATHS.LOGIN,
      element: (
        <FirebaseAuthProvider>
          <Login />
        </FirebaseAuthProvider>
      ),
    },
    {
      path: ROUTE_PATHS.SIGN_UP,
      element: (
        <FirebaseAuthProvider>
          <SignUp />
        </FirebaseAuthProvider>
      ),
    },
    {
      path: ROUTE_PATHS.SIGN_IN,
      element: (
        <FirebaseAuthProvider>
          <SignIn />
        </FirebaseAuthProvider>
      ),
    },
    {
      path: ROUTE_PATHS.RESET_PASSWORD,
      element: (
        <FirebaseAuthProvider>
          <ResetPassword />
        </FirebaseAuthProvider>
      ),
    },
    {
      path: ROUTE_PATHS.LAYOUT,
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: ROUTE_PATHS.DASHBOARD,
          element: (
            <PermissionGuard
              roles={20}
              permissions={permissionsDictionary?.dashboard}
            >
              <DashboardView />
            </PermissionGuard>
          ),
        },

        {
          // path: "tool",
          path: ROUTE_PATHS.TOOL,
          element: (
            <PermissionGuard
              roles={20}
              permissions={permissionsDictionary?.contacts}
            >
              <ToolView />
            </PermissionGuard>
          ),
        },
        {
          // path: "calendar",
          path: ROUTE_PATHS.CALENDAR,
          element: (
            <PermissionGuard
              roles={20}
              permissions={permissionsDictionary?.calendar}
            >
              <CalendarView />
            </PermissionGuard>
          ),
        },
        {
          path: ROUTE_PATHS.SALES,
          element: (
            <PermissionGuard
              roles={40}
              permissions={permissionsDictionary?.sales}
            >
              <Sales />
            </PermissionGuard>
          ),
        },
        {
          path: ROUTE_PATHS.PRODUCTION,
          element: (
            <PermissionGuard
              roles={30}
              permissions={permissionsDictionary?.production}
            >
              <ProductionPage />
            </PermissionGuard>
          ),
        },

        {
          path: ROUTE_PATHS.CONTACTS,
          element: (
            <PermissionGuard
              roles={20}
              permissions={permissionsDictionary?.contacts}
            >
              <Contacts />
            </PermissionGuard>
          ),
        },
        {
          path: ROUTE_PATHS.NOTIFICATIONS,
          element: <Notifications />,
        },
        {
          path: ROUTE_PATHS.CLIENT_VIEW,
          element: (
            <PermissionGuard
              roles={20}
              permissions={permissionsDictionary?.client_view}
            >
              <ClientView />
            </PermissionGuard>
          ),
        },
        {
          path: ROUTE_PATHS.CLIENT_VIEW_ORDER,
          element: (
            <PermissionGuard
              roles={20}
              permissions={permissionsDictionary?.client_view_order}
            >
              <ClientViewOrder />
            </PermissionGuard>
          ),
        },

        {
          path: ROUTE_PATHS.SETTINGS,
          element: (
            <PermissionGuard
              roles={20}
              permissions={permissionsDictionary?.settings_account}
            >
              <SettingsView />
            </PermissionGuard>
          ),
          children: [
            {
              path: ROUTE_PATHS.ACCOUNT,
              element: (
                <PermissionGuard
                  roles={20}
                  permissions={permissionsDictionary?.settings_account}
                >
                  <AccountManagement />
                </PermissionGuard>
              ),
            },
            {
              path: ROUTE_PATHS.ORGANIZATION,
              element: (
                <PermissionGuard
                  roles={40}
                  permissions={permissionsDictionary?.settings_org_management}
                >
                  <OrganizationManagement />
                </PermissionGuard>
              ),
            },
            {
              path: ROUTE_PATHS.USER,
              element: (
                <PermissionGuard
                  roles={40}
                  permissions={permissionsDictionary?.settings_user_management}
                >
                  <UserManagement />
                </PermissionGuard>
              ),
            },
            {
              path: ROUTE_PATHS.PROJECTOR,
              element: (
                <PermissionGuard
                  roles={20}
                  permissions={permissionsDictionary?.settings_screen_projector}
                >
                  <ScreenSettings />
                </PermissionGuard>
              ),
            },
            {
              path: ROUTE_PATHS.CUSTOMER,
              element: (
                <PermissionGuard
                  roles={40}
                  permissions={
                    permissionsDictionary?.settings_customer_management
                  }
                >
                  <CustomerManagement />
                </PermissionGuard>
              ),
            },
            {
              path: ROUTE_PATHS.WEBHOOKS,
              element: (
                <PermissionGuard
                  roles={40}
                  permissions={permissionsDictionary?.settings_org_management}
                >
                  <Webooks />
                </PermissionGuard>
              ),
            },
            {
              path: "notifications",
            },
            {
              path: ROUTE_PATHS.PAYMENTS,
              element: <PaymentManagement />,
            },
            {
              path: "privacy",
            },
            {
              path: ROUTE_PATHS.PRODUCTS,
              element: (
                <PermissionGuard
                  roles={40}
                  permissions={permissionsDictionary?.settings_products}
                >
                  <Products />
                </PermissionGuard>
              ),
            },
            {
              path: ROUTE_PATHS.PACKAGES,
              element: (
                <PermissionGuard
                  roles={40}
                  permissions={permissionsDictionary?.settings_org_management}
                >
                  <PackageManagement />
                </PermissionGuard>
              ),
            },
            {
              path: "documents",
            },
            {
              path: ROUTE_PATHS.TERMS_CONDITIONS,
              element: (
                <PermissionGuard
                  roles={20}
                  permissions={
                    permissionsDictionary?.settings_terms_and_conditions
                  }
                >
                  <TermsConditions />
                </PermissionGuard>
              ),
            },
            {
              path: ROUTE_PATHS.APIS,
              element: (
                <PermissionGuard
                  roles={40}
                  permissions={permissionsDictionary?.settings_org_management}
                >
                  <IntegrationApi />
                </PermissionGuard>
              ),
            },
            {
              path: ROUTE_PATHS.ROOMVIEW,
              element: (
                <PermissionGuard
                  roles={40}
                  permissions={permissionsDictionary?.settings_org_management}
                >
                  <RoomViewSettings />
                </PermissionGuard>
              ),
            },
          ],
        },
      ],
    },
  ]);
  return router1;
}

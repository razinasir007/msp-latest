import { Box } from "@chakra-ui/react";
import React from "react";
import { Outlet } from "react-router-dom";
import { FirebaseAuthProvider } from "../../auth";

import ProtectedRoute from "../../routes/privateRoute";
import CollapseDrawer from "../../components/drawer";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import { CLIENT_ROLE } from "../../../constants";

export default function Layout() {
  const state = useHookstate(globalState);
  const stateUser = state.user.get();
  return (
    <FirebaseAuthProvider>
      <ProtectedRoute>
        <Box display='flex'>
          <CollapseDrawer />
          <Box
            className={
              stateUser?.role?.name === CLIENT_ROLE.name
                ? "mainContentForClient"
                : "mainContent"
            }
          >
            <Outlet />
          </Box>
        </Box>
      </ProtectedRoute>
    </FirebaseAuthProvider>
  );
}

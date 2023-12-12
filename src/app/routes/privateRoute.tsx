import { useHookstate } from "@hookstate/core";
import React from "react";
import { Navigate } from "react-router-dom";
import { globalState } from "../../state/store";
import { useFirebaseAuth } from "../auth";
import { ROUTE_PATHS } from "../../constants";

export default function ProtectedRoute(props) {
  const { user } = useFirebaseAuth && useFirebaseAuth();
  const state = useHookstate(globalState);
  const stateUser = state.user.get();

  if (!stateUser && !user) {
    // user is not authenticated
    return <Navigate to={ROUTE_PATHS.SIGN_IN} />;
  }

  return props.children;
}

import React from "react";
import "./styles/app.scss";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "../apollo/api";

import { ProSidebarProvider } from "react-pro-sidebar";
import { AlertManager } from "./components/alert/alertManager";

// add style imports globally for all our ag-grid components to use
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "./styles/gridCustomStyles.css";
import PermissionsProvider from "./routes/permissionsProvider";
// import "./components/calendar/calendar.css"
export default function App() {
  return (
    <>
      <AlertManager>
        <ProSidebarProvider>
          <ApolloProvider client={apolloClient}>
            <PermissionsProvider />
          </ApolloProvider>
        </ProSidebarProvider>
      </AlertManager>
    </>
  );
}

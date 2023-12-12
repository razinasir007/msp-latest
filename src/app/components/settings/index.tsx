import React from "react";
import { Outlet } from "react-router-dom";
import SettingsDrawer from "../settingsDrawer";
import { Box } from "@chakra-ui/react";

export default function SettingsView() {
  return (
    <Box display='flex'>
      <SettingsDrawer />
      <Box className='settingPageContent'>
        <Outlet />
      </Box>
    </Box>
  );
}

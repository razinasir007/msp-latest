import React, { useEffect, useState } from "react";
import { Divider, Box, Button, VStack } from "@chakra-ui/react";

import { LinkItems } from "./settingsDrawerContent";
import { useNavigate } from "react-router-dom";
import PermissionGuard from "../../routes/permissionGuard";

export default function SettingsDrawer() {
  const navigate = useNavigate();
  const [active, setActive] = useState("");

  // Set first drawer item as active when first navigating to page
  useEffect(() => {
    setActive(LinkItems[0].name);
  }, []);

  return (
    //////////////////////////////////TO AVOID UNIQUE KEY PROPS WARNING///////////////////////////////////////////////////
    <Box
      width='238px'
      padding='16px'
      height='100%'
      backgroundColor='#1f1e1c'
      position='fixed'
    >
      <VStack height='100%' gap={2}>
        {LinkItems.map((link, index) => (
          <PermissionGuard key={index} roles={link.permissionLevel} permissions={link.permissions}>
            <React.Fragment>
              <Button
                variant='mspSettingsMenuButton'
                isActive={active === link.name}
                leftIcon={<link.icon size='1.5em' />}
                onClick={() => {
                  setActive(link.name);
                  navigate(link.path);
                }}
              >
                {link.name}
              </Button>
              {link.name === "Privacy" && (
                <Divider borderColor='#121212' marginTop={"0px !important"} />
              )}
            </React.Fragment>
          </PermissionGuard>
        ))}
      </VStack>
    </Box>
  );
}

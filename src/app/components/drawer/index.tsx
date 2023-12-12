import React, { useEffect, useState } from "react";
import {
  Flex,
  Divider,
  Spacer,
  Text,
  Image,
  Avatar,
  AvatarBadge,
} from "@chakra-ui/react";
import { TbLayoutSidebarRightCollapse } from "react-icons/tb";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { LinkItems } from "./drawerContent";
import { useNavigate } from "react-router-dom";
import { ProfileButton } from "../profileButton";
import { useFirebaseAuth } from "../../auth";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import { FaBell } from "react-icons/fa";
import moment from "moment";
import { useLazyQuery } from "@apollo/client";
import { getNotificationsByOrgId } from "../../../apollo/notificationQueries";

const mainLogo = require("../../../assets/mainLogo.png");
const logo = require("../../../assets/logo.png");
import PermissionGuard from "../../routes/permissionGuard";

const menuButtonStyle = {
  button: () => {
    return {
      color: "#D6D4D0",
      borderRadius: "4px",
      height: "auto",
      ":hover": {
        color: "#FFFFFF",
        backgroundColor: "#33322F",
      },
    };
  },
};

export default function CollapseDrawer() {
  const navigate = useNavigate();
  // const { collapseSidebar } = useProSidebar();
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useFirebaseAuth && useFirebaseAuth();

  //We repopulate the state on auth change, so use this to populate data
  const state = useHookstate(globalState);
  const stateUser = state.user.get();
  const notifications = state.notifications;

  const [active, setActive] = useState("");

  //get notifications query (lazy query so it triggers when the user global state has userId and orgId in it)
  const [
    getNotifications,
    {
      data: notificationsData,
      startPolling: startNotificationsPolling,
      stopPolling: stopNotificationsPolling,
    },
  ] = useLazyQuery(getNotificationsByOrgId);

  //run the use effect for user global state and get notifications of the user
  useEffect(() => {
    if (stateUser) {
      if (
        stateUser!.uid !== undefined &&
        stateUser!.organization?.id !== undefined
      ) {
        getNotifications({
          variables: {
            userId: stateUser!.uid,
            orgId: stateUser!.organization!.id,
            window: 1,
          },
        });
      }
    }
    if (!stateUser && notificationsData) {
      stopNotificationsPolling();
    }
  }, [user]);

  //useEffect for polling
  useEffect(() => {
    // Start polling when the component mounts
    startNotificationsPolling(1000); // Poll every 5 seconds (adjust the interval as needed)
    // Stop polling when the component unmounts
    return () => {
      stopNotificationsPolling();
    };
  }, [startNotificationsPolling, stopNotificationsPolling]);

  //sort out notifications and set them in notifications global state
  useEffect(() => {
    if (notificationsData) {
      if (notificationsData.notifications.getNotifications) {
        // Sorting the notifications based on the timestamp
        const sortedNotifications =
          notificationsData.notifications.getNotifications.sort((a, b) => {
            // Parsing the timestamps using the moment library
            const timestampA = moment(a.notification.timestamp);
            const timestampB = moment(b.notification.timestamp);

            // Comparing the timestamps and returning the sort order
            if (timestampA.isBefore(timestampB)) {
              return 1; // return 1 indicates that a is before b (a should come below  b)
            } else if (timestampA.isAfter(timestampB)) {
              return -1; // return -1 indicates that a is after b (a should come above b)
            } else {
              return 0;
            }
          });

        // Setting the sorted notifications in global notifications state
        notifications.set(sortedNotifications);
      }
    }
  }, [notificationsData]);

  useEffect(() => {
    if (active === "Notifications") {
      stopNotificationsPolling();
    } else startNotificationsPolling(15000);
  }, [active]);

  // Set first drawer item as active when first navigating to page
  useEffect(() => {
    setActive(LinkItems[0].name);
  }, []);

  return (
    <Sidebar
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
      }}
      transitionDuration={300}
      backgroundColor='#121212'
      collapsed={!isOpen}
    >
      <Flex direction='column' height='100%' className='hide-scrollbar'>
        <Menu menuItemStyles={menuButtonStyle}>
          <Flex direction='column' minH='100%'>
            <MenuItem
              key={"main-logo"}
              disabled
              icon={<Image src={logo} boxSize='1.5em' />}
            >
              <Flex alignItems='center' mx='8' justifyContent='space-around'>
                <Image src={mainLogo} style={{ maxWidth: "150%" }} />
              </Flex>
            </MenuItem>
            <Divider />
            {/* ////////////////////////////////////TO AVOID UNIQUE KEY PROPS WARNING///////////////////////////////////////////////////// */}
            {LinkItems.map((link, index) => {
              return (
                <PermissionGuard
                  key={index}
                  roles={link.permissionLevel}
                  permissions={link.permissions}
                >
                  <React.Fragment>
                    <MenuItem
                      active={active == link.name && true}
                      key={index}
                      icon={
                        link.name !== "Notifications" ? (
                          <link.icon size='1.5em' />
                        ) : (
                          <Avatar
                            bg='transparent'
                            fontSize='1rem'
                            icon={<FaBell />}
                            boxSize={"1.8rem"}
                          >
                            {notifications.get() &&
                              notifications
                                .get()
                                .filter((notification) => !notification.isRead)
                                .length > 0 && (
                                <AvatarBadge
                                  bg='whiteAlpha.400'
                                  borderColor={"transparent"}
                                  boxSize={"1.8em"}
                                  fontSize={"10px"}
                                  placement='top-start'
                                >
                                  {
                                    notifications
                                      .get()
                                      .filter(
                                        (notification) => !notification.isRead
                                      ).length
                                  }
                                </AvatarBadge>
                              )}
                          </Avatar>
                        )
                      }
                      onClick={() => {
                        setActive(link.name);
                        navigate(link.path);
                      }}
                    >
                      {link.name}
                    </MenuItem>
                    {link.name === "Contacts" && <Divider />}
                  </React.Fragment>
                </PermissionGuard>
              );
            })}
          </Flex>
        </Menu>
        <Spacer />
        <Menu menuItemStyles={menuButtonStyle}>
          <Flex direction='column' minH='100%'>
            <MenuItem
              key={"collapse-trigger"}
              icon={<TbLayoutSidebarRightCollapse size='1.5em' />}
              onClick={() => setIsOpen(!isOpen)}
            >
              {" "}
              Open/Close
            </MenuItem>
            <Divider />
            <ProfileButton>
              <MenuItem
                key={"user-avatar"}
                icon={
                  <Avatar name={user?.displayName} size='sm'>
                    <AvatarBadge
                      boxSize='0.9em'
                      bg='green.500'
                      borderColor='green.500'
                    />
                  </Avatar>
                }
              >
                <Text>
                  {user.displayName
                    ? user?.displayName
                    : `${stateUser?.firstname} ${stateUser?.lastname}`}
                </Text>
                <Text>{user?.email}</Text>
              </MenuItem>
            </ProfileButton>
          </Flex>
        </Menu>
      </Flex>
    </Sidebar>
  );
}

import React, { useEffect, useState } from "react";
import {
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Modal,
  ModalBody,
  ModalHeader,
  Text,
  Box,
  SimpleGrid,
  SkeletonText,
} from "@chakra-ui/react";
import { Menu, MenuItem } from "react-pro-sidebar";
import { globalState, useGlobalState } from "../../../state/store";
import { LocationCard1 } from "../settings/projectorSettings/locationCard/locationCard";
import { SlScreenDesktop } from "react-icons/sl";
import { SelectDropdown } from "../shared/selectDropdown";
import { GetOrgLocs } from "../../../apollo/organizationQueries";
import { useMutation, useQuery } from "@apollo/client";
import { LocationScreenAndSettings } from "../../../state/interfaces";
import { useHookstate } from "@hookstate/core";
import { GetUser, UpdateUser } from "../../../apollo/userQueries";
import { GetScreenSettingsById } from "../../../apollo/screenSettingsQueries";

const menuButtonStyle = {
  button: () => {
    return {
      paddingRight: "6px",
      borderRadius: "4px",
      height: "auto",
      width: "100%", // Set the width to 100%
      transition: "background-color 0.3s", // Add a transition for smooth hover effect
      // Default style
      backgroundColor: "#121212",
      color: "white",
      // Hover style
      ":hover": {
        backgroundColor: "white",
          color: "black",
      },
    };
  },
};

export const ToolLocationScreens = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const state = useGlobalState();
  const state_global = useHookstate(globalState);
  const userState = useHookstate(globalState.user);
  const selectedScreen = state.getSelectedLocationScrenAndSettings();

  const [screenSettings, setScreenSettings] = useState<
    LocationScreenAndSettings[]
  >([]);
  const [locationName, setLocationName] = useState({});
  const [userDataState, setUserState] = useState({});
  const [loadingId, setLoadingId] = useState("");
  const [favoriteScreen, setFavoriteScreen] = useState(false);
  const orgId = userState.value?.organization?.id;

  const {
    loading: locationLoading,
    error: locationError,
    data: locationData,
    refetch: RefectchLocationAndScreens,
  } = useQuery(GetOrgLocs, {
    variables: { orgId: orgId },
  });
  const { data: screenSettingsData } = useQuery(GetScreenSettingsById, {
    variables: { id: userState.value?.favoriteScreenSetting },
  });

  const { data: UserData, refetch: RefetchUsers } = useQuery(GetUser, {
    variables: { id: userState.value?.uid },
  });

  const [
    updateUser,
    { loading: updateLoading, error: updateError, data: updateData },
  ] = useMutation(UpdateUser);

  function selectFirstNonEmptyScreenSettings(locations, index = 0) {
    // Base case: No valid location found with non-empty screenSettings
    if (index >= locations.length) {
      return;
    }
    const currentLocation = locations[index];
    const screenSettings = currentLocation?.screenSettings;
    // Select the first valid screenSettings and perform the desired operations
    if (screenSettings && screenSettings.length > 0) {
      state.addSelectedLocationScrenAndSettings(screenSettings[0]);
      setScreenSettings(screenSettings.map((ele) => ele));
      setLocationName({
        label: currentLocation.address,
        value: currentLocation.id,
      });
      return; // Stop recursion after the first valid screenSettings is found
    }
    // Continue recursion with the next location in the array
    selectFirstNonEmptyScreenSettings(locations, index + 1);
  }

  useEffect(() => {
    if (UserData) {
      setUserState(UserData);
    }
  }, [UserData]);

  useEffect(() => {
    const locations = locationData?.organizations?.lookup?.locations;
    const favoriteScreen = screenSettingsData?.screenSettings?.lookup;
    const storeLocId = userState?.value?.storeLocId;

    if (favoriteScreen && locations) {
      const locationWithFavoriteScreen = locations.find((location) =>
        location.screenSettings.some(
          (screen) => screen.id === favoriteScreen.id
        )
      );

      if (locationWithFavoriteScreen) {
        // Set the favorite screen as the default
        state.addSelectedLocationScrenAndSettings(favoriteScreen);
        setScreenSettings([favoriteScreen]);
        setLocationName({
          label: locationWithFavoriteScreen.address,
          value: locationWithFavoriteScreen.id,
        });
        return; // Exit early since we found the favorite screen
      }
    }
    // If favorite screen not found or don't exist, proceed with the default logic
    if (storeLocId && locations) {
      const matchingLocation = locations.find(
        (location) => location.id === storeLocId
      );
      if (matchingLocation && matchingLocation.screenSettings) {
        state.addSelectedLocationScrenAndSettings(
          matchingLocation.screenSettings[0]
        );
        setScreenSettings([matchingLocation.screenSettings[0]]);
        setLocationName({
          label: matchingLocation.address,
          value: matchingLocation.id,
        });
        return; // Exit early since we found a matching location
      }
    }

    if (locations) {
      selectFirstNonEmptyScreenSettings(locations);
    }
  }, [locationData, userState, screenSettingsData]);

  const handleCardClick = (value) => {
    state.addSelectedLocationScrenAndSettings(value);
    state.setCalibrationCheck(true);
    onClose();
  };
  const handleDropDownChange = (options) => {
    if (options.value !== null) {
    }
    setLocationName(options);
    setScreenSettings(options.screen);
  };

  const handleFavoriteClick = (data) => {
    setFavoriteScreen(!favoriteScreen);
    setLoadingId(data.id);
    if (!favoriteScreen) {
      // If favoriteScreen is true, the location is being favorited
      updateUser({
        variables: {
          updatedBy: userState.value?.uid,
          user: {
            email: userState.value?.email,
            id: userState.value?.uid,
            address: userState.value?.address,
            firstname: userState.value?.firstname,
            lastname: userState.value?.lastname,
            phoneNumber: userState.value?.phoneNumber,
            storeLocId: userState.value?.storeLocId,
            isOnboarded: userState.value?.isOnboarded,
            isActive: userState.value?.isActive,
            isAdmin:
              userState.value?.grantLevel?.grantLvl == "50" ? true : false,
            favoriteScreenSetting: data.id,
          },
        },
        onCompleted: (data) => {
          RefetchUsers().then((val) => {
            state_global.user.set((prevState) => ({
              ...prevState,
              favoriteScreenSetting:
                val.data.users.lookup.favoriteScreenSetting,
            }));
          });
          alert("favorite added");
          RefectchLocationAndScreens();
        },
      });
    } else {
      // If favoriteScreen is false, the location is being unfavorited
      updateUser({
        variables: {
          updatedBy: userState.value?.uid,
          user: {
            email: userState.value?.email,
            id: userState.value?.uid,
            address: userState.value?.address,
            firstname: userState.value?.firstname,
            lastname: userState.value?.lastname,
            phoneNumber: userState.value?.phoneNumber,
            storeLocId: userState.value?.storeLocId,
            isOnboarded: userState.value?.isOnboarded,
            isActive: userState.value?.isActive,
            isAdmin:
              userState.value?.grantLevel?.grantLvl == "50" ? true : false,
            favoriteScreenSetting: "",
          },
        },
        onCompleted: (data) => {
          RefetchUsers().then((val) => {
            state_global.user.set((prevState) => ({
              ...prevState,
              favoriteScreenSetting: "",
            }));
          });
          alert("favorite removed");
          RefectchLocationAndScreens();
        },
      });
    }
  };
  return (
    <>
      <Menu menuItemStyles={menuButtonStyle}>
        <MenuItem onClick={onOpen} icon={<SlScreenDesktop size='1.8em' />}>
          Location Screens
        </MenuItem>
      </Menu>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size='3xl'>
        <ModalOverlay />
        <ModalContent borderWidth='1px' borderRadius='4px'>
          <ModalHeader>Location Screens</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w='250px'>
              <Text fontSize='p5' fontWeight='semibold'>
                Select a Location:
              </Text>
              <SelectDropdown
                containerHeight='55px'
                value={locationName}
                loading={locationLoading}
                placeholder='Locations'
                options={locationData?.organizations?.lookup?.locations.map(
                  (ele) => ({
                    label: ele.address,
                    value: ele.id,
                    screen: ele.screenSettings,
                  })
                )}
                onChange={handleDropDownChange}
              />
            </Box>
            <SimpleGrid columns={2} spacing='40px'>
              {locationLoading ? (
                <Box
                  padding='6'
                  boxShadow='lg'
                  bg='greys.400'
                  width='100%'
                  minH='235px'
                  maxH='235px'
                  mt='20px'
                  borderRadius='4px'
                >
                  <SkeletonText
                    mt='4'
                    noOfLines={5}
                    spacing='4'
                    skeletonHeight='5'
                  />
                </Box>
              ) : screenSettings && screenSettings.length > 0 ? (
                screenSettings.map((ele, index) => {
                  if (!ele) {
                    return null;
                  }
                  return (
                    <Box key={index} mb='20px'>
                      <LocationCard1
                        favoriteLoading={loadingId === ele.id && updateLoading}
                        favoriteScreen
                        isFavorite={
                          userState.value?.favoriteScreenSetting === ele.id
                            ? true
                            : false
                        }
                        handleFavorite={() => handleFavoriteClick(ele)}
                        screenName={ele.name}
                        active={selectedScreen[0]?.id === ele.id ? true : false}
                        pixelRaio={ele.ppi}
                        onCardClick={() => handleCardClick(ele)}
                      />
                    </Box>
                  );
                })
              ) : (
                <Text>No Location Screens Available</Text>
              )}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

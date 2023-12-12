import React from "react";
import { globalState, useGlobalState } from "../../../state/store";
import { ImmutableArray, State, useHookstate } from "@hookstate/core";

import {
  Box,
  Center,
  Image,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";

import { IoImages } from "react-icons/io5";
import { UploadedPhoto } from "../../../state/interfaces";

export function RoomsView(props: {
  selectedImages: ImmutableArray<UploadedPhoto>;
  selectedProductId: State<string, {}>;
  roomId: State<string, {}>;
  switchView: State<string, {}>;
}) {
  const state = useGlobalState();
  const CustomRooms = state.getToolCustomRooms();
  const rooms = useHookstate(globalState.roomState.rooms);

  return (
    <>
      <Box paddingTop='10px' className='hide-scrollbar' h='100%'>
        <Tabs size={"sm"} colorScheme={"red"}>
          <TabList color={"gray"}>
            <Tab>Default Rooms</Tab>
            <Tab>Custom Rooms</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <VStack spacing='10px'>
                {rooms.get().map((room, index) => (
                  <Box
                    width='100%'
                    height='134px'
                    position='relative'
                    key={index}
                  >
                    <Image
                      objectFit='contain'
                      src={room.url}
                      bg='white'
                      width='100%'
                      height='100%'
                      onClick={() => {
                        props.roomId.set(room.id);
                        props.switchView.set("room");
                      }}
                    />
                  </Box>
                ))}
              </VStack>
            </TabPanel>
            <TabPanel>
              {CustomRooms.length > 0 ? (
                CustomRooms.map((customRoom, index) => {
                  return (
                    <Box
                      width='100%'
                      height='134px'
                      position='relative'
                      key={index}
                    >
                      <Image
                        objectFit='contain'
                        src={customRoom.imageUrl}
                        bg='white'
                        width='100%'
                        height='100%'
                        onClick={() => {
                          state.selectedCustomRoomDetails([customRoom]);
                          props.roomId.set(customRoom.id);
                          props.switchView.set("customRoom");
                        }}
                      />
                    </Box>
                  );
                })
              ) : (
                <Center paddingTop='10px' height='80%'>
                  <VStack spacing={0}>
                    <IoImages color={"#FFFFFF"} size='20px' />
                    <Text color={"#FFFFFF"} fontSize='sm'>
                      No custom room images available.
                    </Text>
                  </VStack>
                </Center>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
}

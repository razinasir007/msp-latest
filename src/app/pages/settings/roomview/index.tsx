import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { UploadRoomImages } from "../../../components/roomViewSettings/UploadRoomImages";
import { globalState, useGlobalState } from "../../../../state/store";
import { IoImages } from "react-icons/io5";
import { useMutation, useQuery } from "@apollo/client";
import {
  DeleteRoomViewDetails,
  GetRoomViewImagesByOrgId,
} from "../../../../apollo/organizationQueries";
import { useHookstate } from "@hookstate/core";
import { RoomDetails } from "../../../../state/interfaces";
import { RoomViewImagesCard } from "../../../components/roomViewSettings/RoomImageCard";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
  marginTop: "20px",
  minHeight: "450px",
};
export const RoomViewSettings = () => {
  const state = useGlobalState();
  const refetchFlag = state.getRefectchRoomCalibration();
  const stateUser = useHookstate(globalState.user);
  const [selectedRoom, setSelectedRoom] = useState({});
  const [loadingId, setLoadingId] = useState();
  const [CustomRoomViewState, setCustomRoomViewState] = useState<RoomDetails[]>(
    []
  );
  const {
    loading: roomViewLoading,
    error: roomViewError,
    data: roomViewData,
    refetch: RefetchRoom,
  } = useQuery(GetRoomViewImagesByOrgId, {
    variables: {
      orgId: stateUser.value?.organization?.id,
      photoType: "RESIZED",
    },
  });
  useEffect(() => {
    if (refetchFlag) {
      RefetchRoom();
    }
  }, [refetchFlag]);
  const [DeleteRoom, DeleteRoomResponse] = useMutation(DeleteRoomViewDetails);
  useEffect(() => {
    if (
      roomViewData &&
      roomViewData.roomView &&
      roomViewData.roomView.lookupByOrganization
    ) {
      const formattedData = roomViewData.roomView.lookupByOrganization.map(
        (details) => {
          return {
            id: details.id,
            imageUrl: `data:image/png;base64,${details.content}`,
            ppi: details.ppi,
            anchorPoints: {
              x: details.x,
              y: details.y,
            },
            type: details.type,
          };
        }
      );
      setCustomRoomViewState(formattedData);
    }
  }, [roomViewData]);
  const handleDeleteRoom = (id) => {
    setLoadingId(id);
    DeleteRoom({
      variables: {
        id: id,
      },
      onCompleted: () => {
        RefetchRoom();
      },
    });
  };
  return (
    <Box height='100%'>
      <Grid
        templateAreas={`"header"
                "content" 
                "footer"`}
        gridTemplateRows={"100px 1fr 61px"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          <Flex justifyContent='space-between'>
            <Text fontSize='h2' fontWeight='semibold' lineHeight='35px'>
              Room View Management
            </Text>
            <UploadRoomImages />
          </Flex>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <Card variant='outline' style={mainCardStyle}>
            <CardHeader fontSize='p4' fontWeight='semibold'>
              Custom Room Images
            </CardHeader>
            <CardBody>
              {roomViewLoading ? (
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
              ) : CustomRoomViewState.length > 0 ? (
                <SimpleGrid columns={3} spacing='20px'>
                  {CustomRoomViewState.map((room, index) => {
                    return (
                      <Box key={index}>
                        <RoomViewImagesCard
                          handleCalibrate={() => setSelectedRoom(room)}
                          image={room.imageUrl}
                          calibratedValue={room.ppi}
                          selectedRoom={selectedRoom}
                          handleDelete={() => handleDeleteRoom(room.id)}
                          deleteRoomLoading={
                            room.id == loadingId && DeleteRoomResponse.loading
                          }
                        />
                      </Box>
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Center
                  minH='235px'
                  mt='50px'
                  flexDirection='column'
                  borderRadius='4px'
                  border={"1px dashed #8A8A8A"}
                >
                  <IoImages size={"40px"} />
                  <Text fontSize='h5' fontWeight='semibold' mt='10px'>
                    No room image available
                  </Text>
                  <Text fontSize='p4' fontWeight='normal'>
                    Please upload a room image
                  </Text>
                </Center>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

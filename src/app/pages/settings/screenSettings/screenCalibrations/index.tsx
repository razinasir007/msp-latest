import React, { useContext, useState } from "react";
import {
  Box,
  Text,
  GridItem,
  Card,
  VStack,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Spacer,
  SkeletonText,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip,
  Input,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import { LocationCard1 } from "../../../../components/settings/projectorSettings/locationCard/locationCard";
import CalibrationScreenModal from "../../../../components/settings/projectorSettings/locationCard/CalibrationScreenModal";
import { FileName } from "../../../../components/settings/projectorSettings/Filename/fileName";
import { useMutation, useQuery } from "@apollo/client";
import { GetOrgLocs } from "../../../../../apollo/organizationQueries";
import {
  DeleteScreenSettings,
  UpdateScreenSettings,
} from "../../../../../apollo/screenSettingsQueries";
import Swal from "sweetalert2";
import { GrFormDown, GrFormUp } from "react-icons/gr";
import { globalState } from "../../../../../state/store";
import { useHookstate } from "@hookstate/core";
import { UserPermissions } from "../../../../routes/permissionGuard";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export function ScreenCalibrations() {
  const { userPermissions } = useContext(UserPermissions);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [screenName, setScreenName] = useState("");
  const [sliderValueCalibration, setSliderValueCalibration] = useState(3);
  const [showPixelTooltip, setShowPixelTooltip] = useState(false);
  const [inchesLength, setInchesLength] = useState<any>(1);
  const pixelLength = 150;
  let sliderValue = 5;
  let currentLength =
    pixelLength + (sliderValueCalibration / 100) * pixelLength;
  let pixelRatio = currentLength / inchesLength;

  const userState = useHookstate(globalState.user);
  const orgId = userState.value?.organization?.id;

  const [cardDetails, setCardDetails] = useState({
    id: "",
    locationId: "",
    name: "",
    ppi: "",
  });
  const [locationDetails, setLocationDetails] = useState({
    address: "",
    id: "",
    name: "",
  });
  const [refetchCheck, setRefetching] = useState(false);
  const [loadingId, setLoadingId] = useState("");

  const {
    loading: locationLoading,
    error: locationError,
    data: locationData,
    refetch: refetchLocations,
  } = useQuery(GetOrgLocs, {
    variables: { orgId: orgId },
  });
  const [DeleteScreen, DeleteScreenResponse] = useMutation(
    DeleteScreenSettings,
    {}
  );
  const [UpdateLocationScreenSettings, UpdateLocationScreenSettingsResponse] =
    useMutation(UpdateScreenSettings, {});

  if (refetchCheck) {
    refetchLocations();
    setRefetching(false);
  }

  const handleCardClick = (values, location) => {
    setLocationDetails(location);
    setCardDetails(values);
    onOpen();
  };

  const handleDelete = (id) => {
    setLoadingId(id);
    DeleteScreen({
      variables: {
        id: id,
      },
      onCompleted: () => {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Screen setting deleted successfully",
        });
        refetchLocations();
      },
    });
  };

  const handleUpdateSettings = () => {
    UpdateLocationScreenSettings({
      variables: {
        updatedBy: userState.value?.uid,
        screenSetting: {
          id: cardDetails.id,
          name: screenName === "" ? cardDetails.name : screenName,
          locationId: locationDetails.id,
          ppi: pixelRatio,
        },
      },
      onCompleted: () => {
        setScreenName("");
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Screen setting updated successfully",
        });
        refetchLocations();
        onClose();
      },
    });
  };
  return (
    <GridItem px='24px' paddingBottom='16px' area={"content"}>
      <VStack spacing='12px'>
        <Card variant='outline' style={mainCardStyle}>
          <Text ml='10px' mt='5px' fontSize='h5' fontWeight='semibold'>
            Locations
          </Text>
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
          ) : (
            locationData?.organizations?.lookup?.locations.map((ele, index) => {
              return (
                <Accordion allowToggle key={index} mt='20px'>
                  <AccordionItem>
                    <Text fontSize='h4'>
                      <AccordionButton>
                        <Flex textAlign='left'>{ele.address}</Flex>
                        <Spacer />
                        <AccordionIcon />
                      </AccordionButton>
                    </Text>
                    <AccordionPanel pb={4}>
                      <SimpleGrid columns={4} spacing='60px'>
                        {ele.screenSettings?.length > 0 ? (
                          ele.screenSettings.map((screen, index) => {
                            return (
                              <Box key={index} mt='10px'>
                                <LocationCard1
                                  screenName={screen.name}
                                  active={
                                    screen.id === cardDetails.id ? true : false
                                  }
                                  pixelRaio={screen.ppi}
                                  onCardClick={() =>
                                    handleCardClick(screen, ele)
                                  }
                                  deleteCard={(event) => {
                                    event.stopPropagation();
                                    handleDelete(screen.id);
                                  }}
                                  deleteLoading={
                                    screen.id === loadingId &&
                                    DeleteScreenResponse.loading
                                  }
                                />
                              </Box>
                            );
                          })
                        ) : (
                          <Text fontSize='p4' mt='20px'>
                            No Screen Available For This Location
                          </Text>
                        )}
                      </SimpleGrid>
                      <VStack mt='15px'>
                        <CalibrationScreenModal
                          locationId={ele.id}
                          setRefetchFlag={setRefetching}
                        />
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              );
            })
          )}
        </Card>
        {/* Filename card */}
        <FileName />
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderWidth='1px' borderRadius='4px'>
          <ModalHeader>Calibration Tool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <Input
                type='text'
                defaultValue={cardDetails.name}
                placeholder='Enter Screen Name'
                onChange={(e) => setScreenName(e.target.value)}
              />
            </Box>
            <Box width='350px'>
              <Text as='sub'>
                Reference Line: {currentLength} px{" "}
                <Text as='i'> ({pixelRatio.toFixed(2)} pixels/inch</Text>)
              </Text>
            </Box>
            <Box width='350px'>
              <Box
                my='10px'
                style={{
                  width: currentLength,
                  height: 5,
                  backgroundColor: "black",
                }}
              />
              <Slider
                maxW='150px'
                width='100%'
                aria-label='Calibrate'
                defaultValue={sliderValue}
                // value={sliderValueCalibration}
                colorScheme='blackAlpha'
                onMouseEnter={() => setShowPixelTooltip(true)}
                onMouseLeave={() => setShowPixelTooltip(false)}
                onChange={(value) => {
                  setSliderValueCalibration(value);
                }}
              >
                <SliderTrack bg='blackAlpha.400'>
                  <SliderFilledTrack bg='blackAlpha.800' />
                </SliderTrack>
                <Tooltip
                  hasArrow
                  bg='black'
                  color='white'
                  placement='top'
                  isOpen={showPixelTooltip}
                  label={`${sliderValueCalibration}`}
                >
                  <SliderThumb />
                </Tooltip>
              </Slider>
            </Box>
            <HStack spacing='10px'>
              <Text width='150px' fontSize='h7'>
                Enter length :
              </Text>
              <HStack w='100%'>
                <Box>
                  <NumberInput
                    size='sm'
                    width='70px'
                    onChange={(value) => setInchesLength(value)}
                    value={inchesLength}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper children={<GrFormUp />} />
                      <NumberDecrementStepper children={<GrFormDown />} />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>
                <Box>
                  <Input
                    borderRadius='4px'
                    type='text'
                    placeholder='In'
                    width='45px'
                    height='32px'
                    textAlign='center'
                    _placeholder={{
                      fontSize: "14px",
                    }}
                  />
                </Box>
              </HStack>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={UpdateLocationScreenSettingsResponse.loading}
              size='sm'
              onClick={handleUpdateSettings}
              isDisabled={
                userPermissions.fullAccess || userPermissions.edit
                  ? false
                  : true
              }
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </GridItem>
  );
}

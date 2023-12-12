import React, { useContext, useState } from "react";
import {
  Box,
  Text,
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
import { v4 as uuidv4 } from "uuid";
import { GrFormUp, GrFormDown } from "react-icons/gr";
import { useMutation } from "@apollo/client";
import { CreateScreenSettings } from "../../../../../apollo/screenSettingsQueries";
import Swal from "sweetalert2";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../../state/store";
import { UserPermissions } from "../../../../routes/permissionGuard";
export default function CalibrationScreenModal(props) {
  const { userPermissions } = useContext(UserPermissions);
  const user = useHookstate(globalState.user);
  const userId = user.value?.uid;
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
  const [
    CreateLocationScreenSettings,
    {
      loading: ScreenSettingsLoading,
      error: ScreenSettingsError,
      data: ScreenSettingsData,
    },
  ] = useMutation(CreateScreenSettings, {});

  const handleDoneClick = () => {
    CreateLocationScreenSettings({
      variables: {
        createdBy: userId,
        screenSetting: {
          id: uuidv4(),
          name: screenName,
          locationId: props.locationId,
          ppi: pixelRatio,
        },
      },
      onCompleted: () => {
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Screen setting created successfully",
        });
        props.setRefetchFlag(true);
        onClose();
      },
    });
  };

  return (
    <>
      <Box>
        <Button
          isDisabled={
            userPermissions.fullAccess || userPermissions.create ? false : true
          }
          onClick={onOpen}
        >
          + Add Screen
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderWidth='1px' borderRadius='4px'>
          <ModalHeader>Calibration Tool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <Input
                type='text'
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
            {/* <Button size="sm" variant="outline" mr={2}>
              Reset
            </Button> */}
            <Button
              size='sm'
              isLoading={ScreenSettingsLoading}
              onClick={handleDoneClick}
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

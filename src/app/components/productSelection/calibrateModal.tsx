import React, { useState } from "react";
import { useHookstate } from "@hookstate/core";
import { globalState, useGlobalState } from "../../../state/store";
import {
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Button,
  Modal,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
  FormControl,
  FormLabel,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Tooltip,
  Box,
} from "@chakra-ui/react";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { Menu, MenuItem } from "react-pro-sidebar";

export function CalibrateModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showPixelTooltip, setShowPixelTooltip] = useState(false);
  const calibrationLocalState = useHookstate({
    sliderValue: 0,
    inchesLength: 2,
  });
  const pixelLength = 150;

  const state = useHookstate(globalState);
  const wrappedState = useGlobalState();

  let currentLength =
    pixelLength + (calibrationLocalState.sliderValue.get() / 100) * pixelLength;
  let pixelRatio = currentLength / calibrationLocalState.inchesLength.get();
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
  return (
    <>
      <Menu menuItemStyles={menuButtonStyle}>
        <MenuItem
          onClick={onOpen}
          icon={<HiAdjustmentsHorizontal size='1.9em' />}
        >
          Calibrate Image
        </MenuItem>
      </Menu>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderWidth='1px' borderRadius='4px'>
          <ModalHeader>Calibration Tool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>How long is the black line in inches?</FormLabel>
              <Input
                defaultValue={calibrationLocalState.inchesLength.get()}
                type='number'
                borderRadius='4px'
                focusBorderColor='gray'
                onChange={(event) => {
                  const updatedValue = parseFloat(event.target.value);
                  if (updatedValue) {
                    calibrationLocalState.inchesLength.set(updatedValue);
                  }
                }}
              />
            </FormControl>
            <Text as='sub'>
              Reference Line: {currentLength} px{" "}
              <Text as='i'> ({pixelRatio.toFixed(2)} pixels/inch</Text>)
            </Text>

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
              aria-label='Calibrate'
              defaultValue={calibrationLocalState.sliderValue.get()}
              value={calibrationLocalState.sliderValue.get()}
              colorScheme='blackAlpha'
              onMouseEnter={() => setShowPixelTooltip(true)}
              onMouseLeave={() => setShowPixelTooltip(false)}
              onChange={(value) => {
                calibrationLocalState.sliderValue.set(value);
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
                label={`${calibrationLocalState.sliderValue.get()}`}
              >
                <SliderThumb />
              </Tooltip>
            </Slider>
          </ModalBody>

          <ModalFooter>
            <Button
              size='sm'
              variant='outline'
              mr={2}
              onClick={() => {
                calibrationLocalState.sliderValue.set(0);
                calibrationLocalState.inchesLength.set(0);
                currentLength = 0;
                pixelRatio = 10;
              }}
            >
              Reset
            </Button>
            <Button
              size='sm'
              onClick={() => {
                wrappedState.setCalibrationCheck(false);
                state.productSelection.pixelRatio.set(pixelRatio);
                onClose();
              }}
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

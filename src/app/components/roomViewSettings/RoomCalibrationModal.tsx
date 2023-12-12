import React, { useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  Box,
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
import { useHookstate } from "@hookstate/core";
import { globalState, useGlobalState } from "../../../state/store";
import { useMutation } from "@apollo/client";
import { calibrationStateType } from "../../../state/interfaces";
import { UpdateRoomDetails } from "../../../apollo/organizationQueries";
import Swal from "sweetalert2";

export const RoomCalibrationModal = (props: {
  handleCalibrate();
  selectedRoom;
}) => {
  const { handleCalibrate, selectedRoom } = props;
  const user = useHookstate(globalState.user);
  const cropper = useHookstate<any>(undefined);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const state = useGlobalState();

  const [calibrationState, setCalibrationState] =
    useState<calibrationStateType>({
      ppi: 0,
      anchorPoints: {
        x: 0,
        y: 0,
      },
    });
  const [UpdateRoom, UpdateRoomResponse] = useMutation(UpdateRoomDetails);
  const setDimensions = () => {
    const instance = cropper.get();
    if (instance) {
      // has the actual dimensions of the cropbox on the image
      const data = instance.getData();

      // holds the dimension of the crop box on the users screen
      const cropBoxData = instance.getCropBoxData();

      // find the ratio from actual to phsical pixels
      const imagepy = pythagorean(data.width, data.height);
      const croppy = pythagorean(cropBoxData.width, cropBoxData.height);
      const scale = croppy / imagepy;

      const paperHypotenuse = 13.9; // inches -> 8.5 x 11 inches
      const ppi = (imagepy / paperHypotenuse) * scale;

      const formattedData = {
        ppi: ppi,
        anchorPoints: {
          x: cropBoxData.left,
          y: cropBoxData.top,
        },
      };
      setCalibrationState(formattedData);
    }
  };
  function pythagorean(sideA, sideB) {
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  }
  const handleDoneClick = () => {
    UpdateRoom({
      variables: {
        updatedBy: user.value!.uid,
        roomView: {
          orgId: user.value?.organization?.id,
          id: selectedRoom.id,
          type: selectedRoom.type,
          ppi: calibrationState.ppi,
          x: calibrationState.anchorPoints.x,
          y: calibrationState.anchorPoints.y,
        },
      },
      onCompleted: (res) => {
        if (res.roomView.updateRoomView == true) {
          onClose();
          state.setRefectchRoomCalibration(true);
          Swal.fire("Success!", "Calibrated successfully!", "success").then(
            () => {
              state.setRefectchRoomCalibration(false);
            }
          );
        }
      },
    });
  };
  return (
    <>
      <Button
        size='sm'
        w='100%'
        onClick={() => {
          onOpen(), handleCalibrate();
        }}
      >
        Calibrate
      </Button>

      <Modal isCentered={true} onClose={onClose} size={"4xl"} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent bg='rgba(0, 0, 0, 0.7)'>
          <ModalCloseButton color='white' />
          <ModalHeader borderTopRadius={"base"} color='white'>
            Calibrate Image
          </ModalHeader>
          <ModalBody borderBottomRadius={"base"}>
            <Box width='100%'>
              <Cropper
                style={{ width: "100%" }}
                initialAspectRatio={1}
                src={selectedRoom.imageUrl}
                viewMode={0}
                minCropBoxHeight={0}
                minCropBoxWidth={10}
                background={false}
                responsive={true}
                checkOrientation={false}
                onInitialized={(instance) => {
                  cropper.set(instance);
                }}
                zoom={(e) => setDimensions()}
                cropmove={(e) => setDimensions()}
                guides={true}
                zoomable={false}
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              isLoading={UpdateRoomResponse.loading}
              onClick={handleDoneClick}
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

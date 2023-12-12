import React, { useState } from "react";
import { UploadedPhoto } from "../../../state/interfaces";
import { ImmutableArray, State } from "@hookstate/core";

import {
  Text,
  Box,
  Center,
  VStack,
  Image,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

import { AiFillFolder } from "react-icons/ai";
import { FaStar } from "react-icons/fa";
import { useContextMenu } from "../imageUploader/useContextMenu";
import { useGlobalState } from "../../../state/store";

export function SelectedView(props: {
  selectedImages: ImmutableArray<UploadedPhoto>;
  selectedImageId: State<string, {}>;
  switchView: State<string, {}>;
  searchItem?: string;
}) {
  const state = useGlobalState();
  const roomViewImagesState = state.getRoomViewImages();
  const { clicked, setClicked } = useContextMenu();
  const [imageIdOnRightClick, setImageIdOnRightClick] = useState("");
  const selectedCustomRoomDetails = state.getSelectedCustomRoomDetails();

  const handleRatingClick = (newRating, image) => {
    state.updatePresentationImage(image, { ...image, rating: newRating });
  };

  const handleRghtClick = (e, imageId) => {
    e.preventDefault();
    setImageIdOnRightClick(imageId);
    setClicked(true);
  };
  const handleImageClick = (image) => {
    if (
      props.switchView.get() === "room" ||
      props.switchView.get() === "customRoom"
    ) {
      const isImageInRoomView = roomViewImagesState.some(
        (roomViewImage) => roomViewImage.id === image.id
      );
      if (isImageInRoomView) {
        // Remove the product from the roomView
        state.removeRoomViewImage(image.id);
      } else {
        // Add the product to the roomView
        if (props.switchView.get() === "customRoom") {
          state.addImageToRoomView(
            image.id,
            image.base64,
            image.path,
            image.resizedBase64,
            image.thumbnailBase64,
            "",
            "",

            selectedCustomRoomDetails[0].anchorPoints.x,
            selectedCustomRoomDetails[0].anchorPoints.y,
            100,
            100
          );
        } else {
          state.addImageToRoomView(
            image.id,
            image.base64,
            image.path,
            image.resizedBase64,
            image.thumbnailBase64,
            "",
            "",

            150,
            350,
            100,
            100
          );
        }
      }
    } else {
      props.selectedImageId.set(image.id);
      props.switchView.set("selectedImage");
    }
  };

  const renderImageInModal = (image) => {
    return (
      <VStack spacing='8px' margin='8px' alignItems='center'>
        <Box key={image.id}>
          <Image
            key={image.id}
            bg='white'
            width='100%'
            maxHeight='134px'
            objectFit='contain'
            src={image.resizedBase64}
          />
        </Box>
        <Center padding={"16px"}>
          {[1, 2, 3].map((value) => (
            <FaStar
              size={16}
              key={value}
              className={value <= image.rating ? "star filled" : "star"}
              onClick={() => handleRatingClick(value, image)}
            />
          ))}
        </Center>
      </VStack>
    );
  };

  const filterImagesBasedOnRatings = (rating) => {
    return (
      <VStack spacing='10px'>
        {props.selectedImages
          .filter((image) => image.rating === rating)
          .map((image) => (
            <Box
              key={image.id}
              onContextMenu={(e) => handleRghtClick(e, image.id)}
              border={
                props.switchView.get() === "room" ||
                props.switchView.get() === "customRoom"
                  ? roomViewImagesState.some(
                      (roomImage) => roomImage.id === image.id
                    )
                    ? "4px solid #648fc4"
                    : "none"
                  : image.id === props.selectedImageId.get() &&
                    "4px solid #648fc4"
              }
            >
              <Image
                key={image.id}
                bg='white'
                width='100%'
                maxHeight='134px'
                objectFit='contain'
                src={image.resizedBase64}
                onClick={() => {
                  handleImageClick(image);
                }}
              />
              <Modal
                isOpen={image.id === imageIdOnRightClick && clicked}
                onClose={() => setClicked(false)}
                size='sm'
                isCentered={true}
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Rate the Image</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>{renderImageInModal(image)}</ModalBody>
                </ModalContent>
              </Modal>
            </Box>
          ))}
      </VStack>
    );
  };

  return (
    <>
      {props.selectedImages.length === 0 ? (
        <Center paddingTop='10px' height='80%'>
          <VStack spacing={0}>
            <AiFillFolder color={"#FFFFFF"} size='20px' />
            <Text color={"#FFFFFF"} fontSize='sm'>
              No selected images.
            </Text>
          </VStack>
        </Center>
      ) : (
        <Box paddingTop='10px' className='hide-scrollbar' h='100%'>
          <Tabs size={"sm"} colorScheme={"red"}>
            <TabList color={"gray"}>
              <Tab>All</Tab>
              <Tab>One</Tab>
              <Tab>Two</Tab>
              <Tab>Three</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing='10px'>
                  {props.selectedImages.map((image) => (
                    <Box
                      key={image.id}
                      onContextMenu={(e) => handleRghtClick(e, image.id)}
                      border={
                        props.switchView.get() === "room" ||
                        props.switchView.get() === "customRoom"
                          ? roomViewImagesState.some(
                              (roomImage) => roomImage.id === image.id
                            )
                            ? "4px solid #648fc4"
                            : "none"
                          : image.id === props.selectedImageId.get() &&
                            "4px solid #648fc4"
                      }
                    >
                      <Image
                        key={image.id}
                        bg='white'
                        width='100%'
                        maxHeight='134px'
                        objectFit='contain'
                        src={image.resizedBase64}
                        onClick={() => {
                          handleImageClick(image);
                        }}
                      />
                      <Center padding={2} bg='#FFFFFF' w='100%'>
                        {[1, 2, 3].map((value) => (
                          <FaStar
                            size={16}
                            key={value}
                            className={
                              value <= image.rating ? "star filled" : "star"
                            }
                          />
                        ))}
                      </Center>
                      <Modal
                        isOpen={image.id === imageIdOnRightClick && clicked}
                        onClose={() => setClicked(false)}
                        size='sm'
                        isCentered={true}
                      >
                        <ModalOverlay />
                        <ModalContent>
                          <ModalHeader>Rate the Image</ModalHeader>
                          <ModalCloseButton />
                          <ModalBody>{renderImageInModal(image)}</ModalBody>
                        </ModalContent>
                      </Modal>
                    </Box>
                  ))}
                </VStack>
              </TabPanel>
              <TabPanel>{filterImagesBasedOnRatings(1)}</TabPanel>
              <TabPanel>{filterImagesBasedOnRatings(2)}</TabPanel>
              <TabPanel>{filterImagesBasedOnRatings(3)}</TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </>
  );
}

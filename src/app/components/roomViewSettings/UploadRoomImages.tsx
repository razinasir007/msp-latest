import React, { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Flex,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Image,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import { RiFolderUploadFill } from "react-icons/ri";
import { globalState, useGlobalState } from "../../../state/store";
import { CustomRoomDetails } from "../../../state/interfaces";
import { DeleteIcon } from "@chakra-ui/icons";
import { useMutation } from "@apollo/client";
import { UploadRoomViewImageeForOrg } from "../../../apollo/organizationQueries";
import { useHookstate } from "@hookstate/core";

export const UploadRoomImages = () => {
  const user = useHookstate(globalState.user);
  const state = useGlobalState();
  const UploadedRoomViewImages = state.getCustomRoomViewDetails();
  const [UploadRoomViewImages, RoomImagesResponse] = useMutation(
    UploadRoomViewImageeForOrg
  );
  const {
    acceptedFiles: roomAcceptedFiles,
    getRootProps: roomGetRootProps,
    getInputProps: roomInputProp,
  } = useDropzone({
    noClick: false,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    roomAcceptedFiles.forEach(async (file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;

          state.addCustomRoomViewDetails(
            dataUrl as string,
            file,
            file.name.split(".")[0],
            NaN,
            0,
            0
          );
        };
        reader.readAsDataURL(file);
      }
    });
  }, [roomAcceptedFiles]);
  const handleDoneClick = () => {
    UploadedRoomViewImages.map((image) => {
      UploadRoomViewImages({
        variables: {
          createdBy: user.value!.uid,
          roomView: {
            orgId: user.value?.organization?.id,
            id: image.id,
            type: image?.file?.type.split("/")[1],
            file: image.file,
          },
        },
        onCompleted: () => {
          onClose();
        },
      });
    });
  };
  console.log("custom room view images", state.getCustomRoomViewDetails());
  return (
    <>
      <Button variant='outline' onClick={onOpen}>
        Upload custom room images
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload room image</ModalHeader>
          <ModalCloseButton />
          <ModalBody className='sidebar-container-class'>
            <VStack>
              <Center
                border='1px dotted black'
                minH='280px'
                w='100%'
                {...roomGetRootProps()}
                cursor='pointer'
              >
                <VStack>
                  <RiFolderUploadFill size={"40px"} />
                  <Text fontSize='md'>
                    <Text as='b'>Upload</Text> a file or drag and drop
                  </Text>
                </VStack>
              </Center>
              <VStack w='100%' maxH='180px' overflowY='scroll'>
                {state.getCustomRoomViewDetails().length > 0 ? (
                  state.getCustomRoomViewDetails().map((ele, index) => {
                    return (
                      <Card w='100%' variant='outline' key={index}>
                        <CardBody>
                          <Flex
                            justifyContent='space-between'
                            alignItems='center'
                          >
                            <HStack>
                              <Image h='28px' w='35px' src={ele.imageUrl} />
                              <Text fontSize='p5'>{ele.name}</Text>
                            </HStack>
                            <IconButton
                              // isLoading={deleteLoading[value.id]}
                              fontSize='18px'
                              variant='unstyled'
                              aria-label='Delete Field'
                              sx={{
                                ":hover": {
                                  backgroundColor: "#EAE8E9",
                                },
                              }}
                              onClick={() =>
                                state.removeCustomRoomViewDetails(ele.id)
                              }
                              icon={<DeleteIcon />}
                            />
                          </Flex>
                        </CardBody>
                      </Card>
                    );
                  })
                ) : (
                  <Text fontSize='p5' fontWeight='semibold'>
                    No Image Uploaded
                  </Text>
                )}
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              size='sm'
              isLoading={RoomImagesResponse.loading}
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

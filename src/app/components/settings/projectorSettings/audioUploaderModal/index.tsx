import {
  Box,
  Text,
  Center,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { RiFolderUploadFill } from "react-icons/ri";

import React, { useState, useContext } from "react";
import { Dropper } from "../../../shared/dropper";
import { useGlobalState } from "../../../../../state/store";
import { UserPermissions } from "../../../../routes/permissionGuard";
export const AudioUploaderModal = (props) => {
  const { userPermissions } = useContext(UserPermissions);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const state = useGlobalState();
  const [filesLen, setFilesLen] = useState<number>(0);
  let uploadedAudios = state.getAudios();
  const handleDone = () => {
    props.setUploadedAudioCards(uploadedAudios);
    setFilesLen(0);
    onClose();
  };
  return (
    <>
      <Button
        isDisabled={
          userPermissions.fullAccess || userPermissions.edit ? false : true
        }
        onClick={onOpen}
      >
        Upload Audio File
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload audio file</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Dropper
              height={200}
              setFilesLen={setFilesLen}
              fileState={state.addAudios}
            >
              <RiFolderUploadFill size={"40px"} />
              <Text fontSize='md'>
                <Text as='b'>Upload</Text> a file or drag and drop
              </Text>
              <Text fontSize='xs'>MP3 Files </Text>
            </Dropper>
            {uploadedAudios.length > 0 ? (
              <Text fontSize='lg' as='b'>
                Uploaded Files : {filesLen}
              </Text>
            ) : (
              <Box>
                <VStack>
                  <Text fontSize='h7' alignSelf='center'>
                    No files choosen
                  </Text>
                </VStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button disabled={!selectedFile} onClick={handleDone}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";

export const CreateFolder = (props: {
  handleAddFolder();
  foldername;
  setFolderName;
}) => {
  const { foldername, setFolderName, handleAddFolder } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box mt='-10px' mb='10px'>
        <Button
          variant='outline'
          boxShadow='0 2px 4px rgba(0, 0, 0, 0.1)'
          onClick={onOpen}
        >
          Create new folder
        </Button>
      </Box>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        size='sm'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new folder</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Input
              placeholder='Enter Folder Name..'
              // value={foldername}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button size='sm' variant='outline' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              size='sm'
              onClick={() => {
                onClose(), handleAddFolder();
              }}
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

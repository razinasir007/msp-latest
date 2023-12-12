import React from "react";
import {
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
} from "@chakra-ui/react";

export function DeleteModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        onClick={onOpen}
        variant='outline'
        fontSize='p5'
        bg='#F3F3F3'
        border='1px solid #D9D9D9'
        color='#D9D9D9'
        size='sm'
      >
        Delete me from this account
      </Button>

      <Modal size='lg' isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius='4px'>
          <ModalHeader
            fontSize='h5'
            lineHeight='28px'
            padding='16px'
            borderBottom='1px'
            borderColor=' greys.300'
          >
            Delete Account
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody padding='16px'>
            <Text
              fontSize='h5'
              fontWeight='normal'
              lineHeight='28px'
              textAlign='center'
            >
              Are you sure you want to <strong>delete </strong>
              your
              <br />
              account? Deleting the account will lose
              <br /> all your information.
            </Text>
          </ModalBody>

          <ModalFooter
            padding='10px 16px'
            borderTop='1px'
            borderColor=' greys.300'
          >
            <Button size='sm' variant='outline' mr={2}>
              Cancel
            </Button>
            <Button size='sm'>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

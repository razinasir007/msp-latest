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
  HStack,
  Flex,
  Link,
} from "@chakra-ui/react";
import { FcApproval } from "react-icons/fc";
export function InformationModal({ isOpen, onClose }) {
  // const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="4px">
          <ModalHeader
            fontSize="h5"
            lineHeight="28px"
            padding="16px"
            borderBottom="1px"
            borderColor=" greys.300"
          >
            <Flex>
              {" "}
              <FcApproval />
              Submission Successful
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody padding="16px">
            <Text
              fontSize="h6"
              fontWeight="normal"
              lineHeight="28px"
              textAlign="center"
            >
              Thank you for the information. This is information will be held
              privately within our database.
            </Text>
          </ModalBody>

          <ModalFooter
            padding="10px 16px"
            borderTop="1px"
            borderColor=" greys.300"
          >
            <Link
              size="sm"
              mr={3}
              onClick={onClose}
            >
              Re-submit
            </Link>
            <Button size="sm" onClick={onClose}>
              Close Tab
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

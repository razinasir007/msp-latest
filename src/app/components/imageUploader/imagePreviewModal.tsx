import React from "react";
import {} from "react-bootstrap";
import {
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Modal,
  ModalHeader,
  ModalBody,
  Image,
  Center,
  Spinner,
} from "@chakra-ui/react";

export default function ImagePreviewModal(props: { image; isOpen; onClose }) {
  const { image, isOpen, onClose } = props;
  return (
    <Modal isCentered={true} onClose={onClose} size={"full"} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent bg='rgba(0, 0, 0, 0.7)'>
        <ModalCloseButton color='white' />
        <ModalHeader borderTopRadius={"base"} color='white'>
          {image.name}
        </ModalHeader>
        <ModalBody borderBottomRadius={"base"}>
          <Center>
            {image.base64 === "" ? (
              <Spinner color='white' />
            ) : (
              <Image
                height={"calc(100vh - 10vh)"}
                width={"calc(100vw - 10vw)"}
                src={image.base64}
                borderRadius={"base"}
                objectFit={"contain"}
              />
            )}
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

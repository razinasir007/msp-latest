import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";

export const ViewDetailsModal = (props: { handleClick(); configuredEvent }) => {
  const { handleClick, configuredEvent } = props;
  const [maxLength, setMaxLength] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (configuredEvent && configuredEvent.attributes && configuredEvent.urls) {
      const maxLength = Math.max(
        configuredEvent.attributes.length,
        configuredEvent.urls.length
      );
      setMaxLength(maxLength);
    }
  }, [configuredEvent]);
  return (
    <>
      <Button
        w='100%'
        mt='20px'
        onClick={() => {
          handleClick(), onOpen();
        }}
      >
        View details
      </Button>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        size='lg'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Event details for {configuredEvent.event_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th>Attributes</Th>
                    <Th>URLs</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {[...Array(maxLength)].map((_, index) => (
                    <Tr key={index}>
                      <Td>{configuredEvent.attributes[index]}</Td>
                      <Td>{configuredEvent.urls[index]}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button size='sm' variant='outline' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

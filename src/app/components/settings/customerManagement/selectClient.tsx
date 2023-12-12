import React, { useState } from "react";
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
  Button,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import Swal from "sweetalert2";
import { SelectDropdown } from "../../shared/selectDropdown";
import { EncryptData } from "../../../../constants";
import { appConfig } from "../../../../config";

export const SelectClient = (props) => {
  const [clientId, setClientId] = useState("");
  const { isOpen: isOpen, onOpen: onOpen, onClose: onClose } = useDisclosure();

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (clientId.length > 0) {
      const url = `${
        appConfig.FRONTEND_URL
      }/form?formName=${props.formName.replace(/ /g, "_")}&orgId=${
        props.orgId
      }&formId=${props.formId}&clientId=${EncryptData(clientId)}`;
      window.open(url, "_blank");
      setClientId("");
    } else {
      onClose();
      Swal.fire({
        icon: "error",
        title: "Client not selected.",
        text: "Please select a client first",
      });
    }
  };
  return (
    <Box>
      <ExternalLinkIcon onClick={onOpen} />
      <Modal isOpen={isOpen} onClose={onClose} isCentered={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Open Form</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb='16px'>
            <VStack width='100%' height='100%' justifyContent='center'>
              <VStack w='100%'>
                <SelectDropdown
                  loading={props.clientsLoading}
                  placeholder=' Select Client from Dropdown'
                  options={props.clientsOptions}
                  label='Choose client'
                  onChange={(selection) => {
                    const clientID = selection.value;
                    setClientId(clientID);
                  }}
                />
                <Button variant='solid' size='md' onClick={handleSubmit}>
                  Open
                </Button>
              </VStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

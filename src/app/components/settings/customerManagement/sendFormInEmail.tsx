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
import { EmailIcon } from "@chakra-ui/icons";
import { LabeledInput } from "../../shared/labeledInput";
import { useMutation } from "@apollo/client";
import { SendFormLink } from "../../../../apollo/formsQueries";
import Swal from "sweetalert2";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { SelectDropdown } from "../../shared/selectDropdown";
import { EncryptData } from "../../../../constants";
import { appConfig } from "../../../../config";

export const SendFormInEmail = (props) => {
  const user = useHookstate(globalState.user);
  const [emailAddress, setEmailAddress] = useState("");
  const [cleintId, setClientId] = useState("");
  const [sendEmail, { loading: sendEmailLoading }] = useMutation(SendFormLink);
  const { isOpen: isOpen, onOpen: onOpen, onClose: onClose } = useDisclosure();

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    let url;
    if (props.formName === "INTAKE_FORM") {
      url = `${appConfig.FRONTEND_URL}/form?formName=${props.formName}&orgId=${
        props.orgId
      }&locId=${EncryptData(user!.value!.storeLocId)}&formId=${props.formId}`;
    } else {
      if (cleintId.length > 0) {
        url = `${appConfig.FRONTEND_URL}/form?formName=${props.formName.replace(
          / /g,
          "_"
        )}&orgId=${props.orgId}&formId=${props.formId}&clientId=${EncryptData(
          cleintId
        )}`;
      } else {
        onClose();
        Swal.fire({
          icon: "error",
          title: "Client not selected.",
          text: "Please select a client first",
        });
        return;
      }
    }

    sendEmail({
      variables: {
        email: emailAddress,
        subject: props.formName,
        content: `
        <html>
        <body>
        <p>
            Hi,
        </p>
        <p>
            Click on the following link and fill out our form...
        </p>
        <p>${url}</p>
        <p>MyStudioPro</p>
        </body>
        </html>
        `,
      },
      onCompleted: (data) => {
        Swal.fire({
          icon: "success",
          title: "Email Sent",
          text: "Email sent successfully",
        });
        onClose();
        setEmailAddress("");
        setClientId("");
      },
    });
  };
  return (
    <Box>
      <EmailIcon onClick={onOpen} />
      <Modal isOpen={isOpen} onClose={onClose} isCentered={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Form</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb='16px'>
            <VStack width='100%' height='100%' justifyContent='center'>
              <EmailIcon fontSize={"90px"} />
              {props.formName === "INTAKE_FORM" ? (
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                  <VStack w='100%'>
                    <LabeledInput
                      type='email'
                      required={true}
                      placeholder='Provide email address...'
                      containerHeight='35px'
                      onChange={(event) => {
                        const value = event.target.value;
                        setEmailAddress(value);
                      }}
                    />
                    <Button
                      type='submit'
                      variant='solid'
                      size='md'
                      isLoading={sendEmailLoading}
                    >
                      Send
                    </Button>
                  </VStack>
                </form>
              ) : (
                <VStack w='100%'>
                  <SelectDropdown
                    loading={props.clientsLoading}
                    placeholder=' Select Client from Dropdown'
                    options={props.clientsOptions}
                    label='Choose client'
                    onChange={(selection) => {
                      const email = selection.email;
                      const clientID = selection.value;
                      setEmailAddress(email);
                      setClientId(clientID);
                    }}
                  />
                  <Button
                    variant='solid'
                    size='md'
                    isLoading={sendEmailLoading}
                    onClick={handleSubmit}
                  >
                    Send
                  </Button>
                </VStack>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

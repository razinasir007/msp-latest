import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { mainCardStyle } from "../../../pages/settings/termsConditions";
import { LabeledInput } from "../../shared/labeledInput";
import { v4 as uuidv4 } from "uuid";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { SelectDropdown } from "../../shared/selectDropdown";
import { termsTypeOptions } from "../../../../constants";
import {UserPermissions} from "../../../routes/permissionGuard"

export function AddTerms(props) {
  const { userPermissions } = useContext(UserPermissions);

  //to open/close the drawer
  const { isOpen, onOpen, onClose } = useDisclosure();
  //new term will be stored in this state and then passed on to the parent when save button is clicked
  const [newTerm, setNewTerm] = useState({
    title: "",
    description: "",
    type: "",
    isRequired: false,
  });

  //this function will be called when save button is clicked
  const save = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    //the coming terms will be allotted a unique id
    let termId = uuidv4();
    const term = {
      variables: {
        createdBy: props.user.uid,
        termAndCondition: {
          id: termId,
          title: newTerm.title,
          type: newTerm.type,
          description: newTerm.description,
          isRequired: newTerm.isRequired,
          orgId: props.user.organization.id,
        },
      },
    };
    //the new terms will be passed to parent component as parameters. the new terms will be saved there
    props.handleSave(term, onClose);
  };

  useEffect(() => {
    if (isOpen) {
      setNewTerm({
        title: "",
        description: "",
        type: "",
        isRequired: false,
      });
    }
  }, [isOpen]);

  return (
    <>
      <Button
        isDisabled={
          userPermissions.fullAccess || userPermissions.create ? false : true
        }
        size='sm'
        leftIcon={<AddIcon />}
        onClick={onOpen}
      >
        Add Terms and Conditions
      </Button>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size={"xs"}>
        <DrawerOverlay />
        <form onSubmit={save}>
          <DrawerContent>
            <DrawerHeader
              borderBottomWidth='1px'
              padding='16px 24px'
              borderColor='greys.300'
            >
              <Flex w='100%'>
                <Text fontSize='h6' fontWeight='semibold' lineHeight='22px'>
                  Add Terms and Conditions
                </Text>
                <DrawerCloseButton />
              </Flex>
            </DrawerHeader>
            <DrawerBody mt='8px'>
              <VStack width='100%' alignItems={"flex-start"} spacing='8px'>
                {/* Type of T&C */}
                <Box width='100%'>
                  <Text fontSize={"p4"} fontWeight='normal'>
                    Type
                  </Text>
                  <SelectDropdown
                    isClearable={false}
                    options={termsTypeOptions}
                    placeholder='Select Type'
                    containerHeight='33px'
                    // containerWidth='200px'
                    // defaultValue={StatusOptions[0]}
                    // value={newTerm.type}
                    onChange={(selection) => {
                      setNewTerm({
                        ...newTerm,
                        type: selection.value,
                      });
                    }}
                  />
                </Box>
                {/* title of T&C */}
                <LabeledInput
                  label='Title'
                  placeholder='Title...'
                  name='title'
                  value={newTerm.title}
                  required={true}
                  onChange={(event) => {
                    newTerm.title = event.target.value;
                    setNewTerm({ ...newTerm });
                  }}
                />
                {/* description of T&C */}
                <Box w='100%'>
                  <Text fontSize={"p4"} fontWeight='normal'>
                    Description
                  </Text>
                  <Textarea
                    rows={15}
                    required={true}
                    size='xs'
                    placeholder='Description...'
                    name='description'
                    _placeholder={{
                      fontSize: "14px",
                    }}
                    borderRadius='4px'
                    value={newTerm.description}
                    onChange={(event) => {
                      newTerm.description = event.target.value;
                      setNewTerm({ ...newTerm });
                    }}
                  />
                </Box>
                {/* required (isRequired) */}
                <Checkbox
                  onChange={(event) => {
                    newTerm.isRequired = event.target.checked;
                    setNewTerm({ ...newTerm });
                  }}
                >
                  Required
                </Checkbox>
              </VStack>
            </DrawerBody>
            <DrawerFooter
              borderTopWidth='1px'
              padding='16px 24px'
              borderColor='greys.300'
            >
              <Box>
                {/* Cancel button */}
                <Button variant='outline' size='sm' onClick={onClose}>
                  Cancel
                </Button>
                {/* Save button */}
                <Button
                  type='submit'
                  leftIcon={<CheckIcon />}
                  variant='solid'
                  marginLeft='16px'
                  size='sm'
                  isLoading={props.createLoading}
                >
                  Save
                </Button>
              </Box>
            </DrawerFooter>
          </DrawerContent>
        </form>
      </Drawer>
    </>
  );
}

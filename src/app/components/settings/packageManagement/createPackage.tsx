import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
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
import { useMutation } from "@apollo/client";
import { LabeledInput } from "../../shared/labeledInput";
import { v4 as uuidv4 } from "uuid";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { SelectDropdown } from "../../shared/selectDropdown";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { CreatePackageMutation } from "../../../../apollo/packageQueries";
import Swal from "sweetalert2";

export function CreatePackage(props) {
  const stateUser = useHookstate(globalState.user);
  //to open/close the drawer
  const { isOpen, onOpen, onClose } = useDisclosure();
  //new term will be stored in this state and then passed on to the parent when save button is clicked
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    sizes: [],
    price: 0,
  });

  const [
    createPackage,
    {
      loading: createPackageLoading,
      error: createPackageError,
      data: createPackageData,
    },
  ] = useMutation(CreatePackageMutation, {});

  //this function will be called when save button is clicked
  const save = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    let packageId = uuidv4();
    const packageSizes = newPackage.sizes.map((size) => {
      return size.id;
    });
    const packageCreated = {
      id: packageId,
      orgId: stateUser!.get()!.organization!.id,
      name: newPackage.name,
      description: newPackage.description,
      sizes: packageSizes,
      price: newPackage.price,
    };

    createPackage({
      variables: {
        createdBy: stateUser!.get()?.uid,
        ...packageCreated,
      },
      onCompleted: (resp) => {
        if (resp.packages.createPackage === true) {
          props.packages
            ? props.setPackages([
                ...props.packages,
                { ...packageCreated, sizes: newPackage.sizes },
              ])
            : props.setPackages([
                { ...packageCreated, sizes: newPackage.sizes },
              ]);
          Swal.fire({
            icon: "success",
            title: "Package created successfully.",
            text: "Thank you.",
          });
          onClose();
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Could not create package. Please try again.",
          });
        }
      },
    });
  };

  useEffect(() => {
    if (isOpen) {
      setNewPackage({
        name: "",
        description: "",
        sizes: [],
        price: 0,
      });
    }
  }, [isOpen]);

  const handleDropDownChange = (option) => {
    const updatedPackage = {
      ...newPackage,
      sizes: option.map((opt) => {
        return { id: opt.value, size: opt.label };
      }),
    };
    setNewPackage(updatedPackage);
  };

  return (
    <>
      <Button size='sm' leftIcon={<AddIcon />} onClick={onOpen}>
        Create Package
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
                  Create Package
                </Text>
                <DrawerCloseButton />
              </Flex>
            </DrawerHeader>
            <DrawerBody mt='8px'>
              <VStack width='100%' alignItems={"flex-start"} spacing='8px'>
                <Box width='100%'>
                  <LabeledInput
                    required={true}
                    label='Name'
                    placeholder='Name...'
                    onChange={(event) => {
                      const updatedPackage = {
                        ...newPackage,
                        name: event.target.value,
                      };
                      setNewPackage(updatedPackage);
                    }}
                    value={newPackage.name}
                    name='name'
                  />
                </Box>
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
                    value={newPackage.description}
                    onChange={(event) => {
                      const updatedPackage = {
                        ...newPackage,
                        description: event.target.value,
                      };
                      setNewPackage(updatedPackage);
                    }}
                  />
                </Box>
                <Box width='100%'>
                  <Text fontSize={"p4"} fontWeight='normal'>
                    Size
                  </Text>
                  <SelectDropdown
                    containerHeight='55px'
                    labelSize='p4'
                    placeholder='Sizes'
                    isClearable={false}
                    // loading={getReminderLoading}
                    isMulti={true}
                    value={newPackage.sizes.map((ele) => {
                      return { label: ele.size, value: ele.id };
                    })}
                    options={
                      props.sizeOptions &&
                      props.sizeOptions.map((ele) => ({
                        label: ele.size,
                        value: ele.id,
                      }))
                    }
                    onChange={(values) => handleDropDownChange(values)}
                  />
                </Box>
                <Box width='100%'>
                  <LabeledInput
                    required={true}
                    type='number'
                    label='Price'
                    placeholder='Price...'
                    onChange={(event) => {
                      const updatedPackage = {
                        ...newPackage,
                        price: Number(event.target.value),
                      };
                      setNewPackage(updatedPackage);
                    }}
                    value={newPackage.price}
                    name='price'
                  />
                </Box>
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
                  isLoading={createPackageLoading}
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

import React, { useEffect, useState } from "react";
import { AddIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
  VStack,
  Image,
  Flex,
  Box,
  IconButton,
  HStack,
  Checkbox,
  Center,
  ModalFooter,
  Link,
  SkeletonText,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useHookstate } from "@hookstate/core";
import { FieldDatatypeEnum } from "../../../../apollo/gql-types/graphql";
import { globalState } from "../../../../state/store";
import { Signature } from "../../checkoutForm/signature";
import { AddressInput } from "../../shared/addressInput";
import { LabeledInput } from "../../shared/labeledInput";
import { GetFieldsByFormId } from "../../../../apollo/formsQueries";
import { useLazyQuery, useQuery } from "@apollo/client";
import { staticFields } from "./formBuilder";

const mainCardStyle = {
  padding: 0,
  width: "60%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export const FormPreviewModal = (props) => {
  //this state carries the term being opened in the modal
  const [termOpened, setTermOpened] = useState({
    id: "",
    description: "",
    is_required: true,
    orgId: "",
    sortingIndex: 1,
    title: "",
    type: "",
  });

  //to open terms and conditions modal
  const {
    isOpen: isOpenFormPreview,
    onOpen: onOpenFormPreview,
    onClose: onCloseFormPreview,
  } = useDisclosure();

  //to open and close add-field drawer
  const {
    isOpen: isOpenTerms,
    onOpen: onOpenTerms,
    onClose: onCloseTerms,
  } = useDisclosure();

  // const {
  //   loading: fieldsLoading,
  //   error: fieldsError,
  //   data: fieldsData,
  // } = useQuery(GetFieldsByFormId, {
  //   variables: { formId: props.formId },
  // });

  const [
    getFormFields,
    { loading: fieldsLoading, error: fieldsError, data: fieldsData },
  ] = useLazyQuery(GetFieldsByFormId);

  useEffect(() => {
    if (fieldsData?.organizationForms?.getItems?.data) {
      // let updatedFormFields = [...props.formFields];
      const filteredFields = fieldsData.organizationForms.getItems.data.map(
        (field) => {
          if (field.type === "client") {
            if (field.data.datatype === "TEXT") {
              const newField = {
                data: {
                  created_by: field.data.created_by,
                  inputType: {
                    label: field.data.datatype,
                    value: field.data.datatype,
                  },
                  id: field.data.id,
                  is_enabled: field.data.is_enabled,
                  is_required: field.data.is_required,
                  name: field.data.name,
                  org_id: field.data.org_id,
                  sorting_index: field.data.sorting_index,
                  updated_by: field.data.updated_by,
                  value: field.value,
                },
                sorting_index: field.sorting_index,
                type: field.type,
              };
              return newField;
            } else if (field.data.datatype === "LIST") {
              const newField = {
                data: {
                  created_by: field.data.created_by,
                  inputType: {
                    label: field.data.datatype,
                    value: field.data.datatype,
                  },
                  id: field.data.id,
                  is_enabled: field.data.is_enabled,
                  is_required: field.data.is_required,
                  name: field.data.name,
                  org_id: field.data.org_id,
                  sorting_index: field.data.sorting_index,
                  updated_by: field.data.updated_by,
                  value: [""],
                },
                sorting_index: field.sorting_index,
                type: field.type,
              };
              return newField;
            } else {
              const newField = {
                data: {
                  created_by: field.data.created_by,
                  inputType: {
                    label: field.data.datatype,
                    value: field.data.datatype,
                  },
                  id: field.data.id,
                  is_enabled: field.data.is_enabled,
                  is_required: field.data.is_required,
                  name: field.data.name,
                  org_id: field.data.org_id,
                  sorting_index: field.data.sorting_index,
                  updated_by: field.data.updated_by,
                },
                sorting_index: field.sorting_index,
                type: field.type,
              };
              return newField;
            }
          } else if (field.type === "term") {
            const newTerm = {
              type: field.type,
              sorting_index: field.sorting_index,
              data: {
                id: field.data.id,
                org_id: field.data.org_id,
                title: field.data.title,
                description: field.data.description,
                type: field.data.type,
                is_required: field.data.is_required,
                created_by: field.data.created_by,
                updated_by: field.data.updated_by,
              },
            };
            return newTerm;
          }
        }
      );
      const updatedFormFields = [staticFields, ...filteredFields];
      props.setFormFields(updatedFormFields);
    } else {
      const emptyForm = [staticFields];
      props.setFormFields(emptyForm);
    }
  }, [fieldsData]);

  //get the user
  const user = useHookstate(globalState.user);

  //map fields inside the form based on their type
  const mapDynamicFields = (field, index) => {
    if (field.type === "term") {
      return (
        <Flex width='100%' alignItems='flex-start' gap='8px' key={index}>
          <VStack gap='2px' w='97%' alignItems='left'>
            <Link
              fontWeight='semibold'
              onClick={() => {
                setTermOpened(field.data);
                onOpenTerms();
              }}
            >
              {field.data.title}
            </Link>
            <HStack>
              <Text>I agree</Text>
              <Checkbox
                defaultChecked
                disabled={field.data.is_required}
              ></Checkbox>
            </HStack>
            {index === field.sorting_index && (
              <Modal
                isOpen={isOpenTerms}
                onClose={onCloseTerms}
                size='xl'
                isCentered={true}
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>{termOpened.title}</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <VStack spacing='8px' margin='8px' alignItems='flex-start'>
                      <Text fontSize='h7' fontWeight='semibold'>
                        Description
                      </Text>
                      <Text fontSize='p6' fontWeight='normal'>
                        {termOpened.description}
                      </Text>
                      <Text fontSize='h7' fontWeight='semibold'>
                        {termOpened.is_required
                          ? "Compulsory"
                          : "Not compulsory"}
                      </Text>
                    </VStack>
                  </ModalBody>
                </ModalContent>
              </Modal>
            )}
          </VStack>
        </Flex>
      );
    } else if (field.type === "client") {
      switch (field.data.inputType.value) {
        case "CREDENTIALS":
          return (
            <VStack spacing='8px'>
              <HStack width='100%' spacing='10px'>
                <LabeledInput
                  containerHeight='55px'
                  label='First Name'
                  labelSize='p5'
                  name='firstname'
                  placeholder='Enter First Name'
                  type='text'
                />
                <LabeledInput
                  containerHeight='55px'
                  label='Last Name'
                  labelSize='p5'
                  name='lastname'
                  type='text'
                  placeholder='Enter Last Name'
                />
              </HStack>
              <HStack width='100%' spacing='10px'>
                <LabeledInput
                  containerHeight='55px'
                  label='Email'
                  type='email'
                  labelSize='p5'
                  name='email'
                  placeholder='Enter Your Email...'
                />
                <LabeledInput
                  containerHeight='55px'
                  label='Phone Number'
                  labelSize='p5'
                  placeholder='Enter Phone Number...'
                  name='phoneNumber'
                  type='Number'
                />
              </HStack>
              <Box width='100%'>
                <AddressInput
                  label='Location'
                  labelSize='h7'
                  placeholder='Enter Location'
                  name='billingAddress'
                  defaultValue={""}
                  handleLocationChange={() => {
                    console.log("dont handle change");
                  }}
                />
              </Box>
            </VStack>
          );
        case FieldDatatypeEnum.String:
          return (
            <Flex width='100%' alignItems='flex-start'>
              <LabeledInput
                key={index}
                label={field.data.name}
                labelSize='h7'
                placeholder={`Enter Your ${field.data.name}`}
                type='text'
              />
            </Flex>
          );
        case FieldDatatypeEnum.Number:
          return (
            <Flex width='100%' alignItems='flex-start'>
              <LabeledInput
                key={index}
                label={field.data.name}
                labelSize='h7'
                placeholder={`Enter Your ${field.data.name}`}
                type='number'
              />
            </Flex>
          );
        case FieldDatatypeEnum.Boolean:
          return (
            <Flex width='100%' gap='8px' alignItems='flex-start' key={index}>
              <Text alignSelf='flex-start' fontSize='h7'>
                {field.data.name}
              </Text>
              <Checkbox defaultChecked></Checkbox>
            </Flex>
          );
        case FieldDatatypeEnum.Signature:
          return (
            <Box>
              <Flex width='100%' key={index} alignItems='flex-start'>
                <Text alignSelf='flex-start' fontSize='h7'>
                  {field.data.name}
                </Text>
              </Flex>
              <Signature />
            </Box>
          );
        case FieldDatatypeEnum.Text:
          return (
            <Flex w='100%' alignItems='flex-start'>
              <Text fontWeight='semibold' fontSize='p5'>
                {field.data.value?.length > 0 ? field.data.value : "Add Text"}
              </Text>
            </Flex>
          );
        case FieldDatatypeEnum.List:
          return (
            <Flex width='100%' alignItems='flex-start'>
              <Box width='100%' key={index}>
                <Text fontSize='h7' alignSelf='flex-start'>
                  {field.data.name}
                </Text>
                <VStack w='100%' spacing='4px'>
                  {field.data.value.map((value, i) => (
                    <HStack w='100%' key={i}>
                      <LabeledInput
                        containerHeight='30px'
                        labelSize='p5'
                        type='text'
                        placeholder={`Enter Your ${field.data.name}`}
                      />
                      <IconButton
                        sx={{
                          ":hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                        fontSize='18px'
                        variant='ghost'
                        height='fit-content'
                        aria-label='Delete List Item'
                        icon={<DeleteIcon />}
                        style={{ marginTop: "7px" }}
                        onClick={() => {
                          props.setFormFields((prev) => {
                            return prev.map((list) => {
                              if (list.sorting_index === index) {
                                if (i === 0 && list.data.value.length === 1) {
                                  return list;
                                } else {
                                  let updatedList = [...list.data.value];
                                  updatedList.splice(i, 1);
                                  return {
                                    ...list,
                                    data: {
                                      ...list.data,
                                      value: updatedList,
                                    },
                                  };
                                }
                              }
                              return list;
                            });
                          });
                        }}
                      />
                    </HStack>
                  ))}
                </VStack>
                <IconButton
                  sx={{
                    ":hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                  mt='16px'
                  variant='ghost'
                  height='fit-content'
                  aria-label='Add List Item'
                  alignSelf='flex-start'
                  icon={<AddIcon />}
                  onClick={() => {
                    const updatedFields = props.formFields.map((field) => {
                      if (field.sorting_index === index) {
                        const elementAdded = [...field.data.value, ""];
                        return {
                          ...field,
                          data: { ...field.data, value: elementAdded },
                        };
                      }
                      return field;
                    });
                    props.setFormFields(updatedFields);
                  }}
                />
              </Box>
            </Flex>
          );
        case FieldDatatypeEnum.Date:
        case FieldDatatypeEnum.Datetime:
          return (
            <Flex width='100%' alignItems='flex-start'>
              <LabeledInput
                key={index}
                containerHeight='55px'
                label={field.data.name}
                type={
                  field.data.inputType.value === FieldDatatypeEnum.Datetime
                    ? "datetime-local"
                    : "date"
                }
                labelSize='p5'
                placeholder={`Enter Your ${field.data.name}`}
              />
            </Flex>
          );
      }
    }
  };
  return (
    <>
      <ViewIcon
        onClick={() => {
          getFormFields({
            variables: { formId: props.formId },
          });
          onOpenFormPreview();
        }}
      />
      <Modal
        isOpen={isOpenFormPreview}
        size='full'
        onClose={onCloseFormPreview}
      >
        <ModalOverlay />
        <ModalContent backgroundColor='#F7F5F0'>
          <ModalHeader>Form Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody mt='16px' mb='16px'>
            <Center width='100%'>
              <Card style={mainCardStyle}>
                <CardBody padding='16px' height='auto'>
                  <form>
                    <VStack height='auto' mb='16px'>
                      {user!.value?.organization?.logo ? (
                        <Image
                          src={`data:image/png;base64,${
                            user!.value?.organization?.logo
                          }`}
                          w='200px'
                          h='150px'
                        />
                      ) : (
                        <Flex
                          justifyContent='center'
                          alignItems='center'
                          h='150px'
                          w='100%'
                        >
                          <Text fontSize='h5' fontWeight='semibold'>
                            No Organization Logo
                          </Text>
                        </Flex>
                      )}

                      <Text fontSize='h6' fontWeight='semibold'>
                        {user!.value?.organization?.name}
                      </Text>
                    </VStack>
                    {fieldsLoading ? (
                      <Box
                        padding='6'
                        boxShadow='lg'
                        bg='greys.400'
                        width='100%'
                        minH='235px'
                        maxH='235px'
                        // mt='20px'
                        borderRadius='4px'
                      >
                        <SkeletonText
                          mt='4'
                          noOfLines={5}
                          spacing='4'
                          skeletonHeight='5'
                        />
                      </Box>
                    ) : (
                      <VStack spacing='14px' height='auto'>
                        {props.formFields &&
                          props.formFields.length > 0 &&
                          props.formFields.map((field, index) => (
                            <Flex
                              w='100%'
                              alignItems='center'
                              justifyContent='center'
                              key={index}
                              id={field.data.id}
                            >
                              <Box w='100%' h='100%'>
                                {mapDynamicFields(field, index)}
                              </Box>
                            </Flex>
                          ))}
                      </VStack>
                    )}
                  </form>
                </CardBody>
              </Card>
            </Center>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onCloseFormPreview}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

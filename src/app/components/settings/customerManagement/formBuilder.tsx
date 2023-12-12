import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Image,
  Text,
  Card,
  HStack,
  IconButton,
  Checkbox,
  CardHeader,
  Flex,
  Button,
  CardBody,
  Grid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Switch,
  useDisclosure,
  Textarea,
  Divider,
  Link,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalOverlay,
  SkeletonText,
  Center,
} from "@chakra-ui/react";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { LabeledInput } from "../../shared/labeledInput";
import { AddressInput } from "../../shared/addressInput";
import { Signature } from "../../checkoutForm/signature";
import { FieldDatatypeEnum } from "../../../../apollo/gql-types/graphql";
import {
  AddIcon,
  CloseIcon,
  DeleteIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { UpdateCustomerField } from "../../../../apollo/customerFieldQueries";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MdOutlineDragIndicator } from "react-icons/md";
import { FieldDrawer } from "./fieldDrawer";
import { FormPreviewModal } from "./formPreviewModal";
import { TermsAndConditions } from "../../interfaces";
import { GetTermsConditions } from "../../../../apollo/termsConditionsQueries";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import {
  GetFieldsByFormId,
  UpdateFormFields,
} from "../../../../apollo/formsQueries";
import Swal from "sweetalert2";

//card styles of the form preview
const mainCardStyle = {
  padding: 0,
  width: "100%",
  minHeight: "100vh",
  borderRadius: "4px",
  borderColor: "greys.300",
};
//card styles of the editable fields and t&c tool kit
const ToolkitCardStyle = {
  padding: 0,
  width: "100%",
  backgroundColor: "#F7F5F0",
  borderRadius: "0px",
};

// This is used as a type of field inside form to map following fields:
// 1- First name
// 2- Last name
// 3- Email
// 4- Phone number
// 5- Location
export const staticFields = {
  type: "client",
  sorting_index: 0,
  data: {
    id: "1",
    name: "CREDENTIALS",
    inputType: {
      value: "CREDENTIALS",
      label: "CREDENTIALS",
    },
    required: true,
  },
};

export function FormBuilder(props: {
  formFields?: Array<any>;
  setFormFields?: any;
  fields?: Array<any>;
  setFields?: any;
  setUpdateOrder?: any;
  handleDeleteField?: any;
  formId?: string;
  setFormBuilder?: any;
}) {
  const {
    formFields,
    setFormFields,
    fields,
    setFields,
    setUpdateOrder,
    handleDeleteField,
    formId,
    setFormBuilder,
  } = props;
  //this state contains the index of the text field which is being edited
  const [editText, setEditText] = useState("");
  //state to carry all terms and conditions
  const [terms, setTerms] = useState<TermsAndConditions[]>([]);
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

  //this state will contain the new field which is being added through add-field drawer
  const [fieldForDrawer, setFieldForDrawer] = useState<any>({
    id: "",
    name: "",
    inputType: {
      value: "",
      label: "",
    },
    required: false,
  });

  //getting user from the global state
  const user = useHookstate(globalState.user);

  //Get all terms and  conditions from server
  const {
    loading: termsLoading,
    error: termsError,
    data: termsData,
  } = useQuery(GetTermsConditions, {
    variables: { orgId: user!.value?.organization?.id },
  });

  //Mutation to save the fields for a form
  const [
    updatedFormFields,
    { loading: updateFormFieldsLoading, data: updateFormFieldsData },
  ] = useMutation(UpdateFormFields);

  //setting terms and conditions coming from the server to terms state
  useEffect(() => {
    if (termsData) {
      const formattedData = termsData.termsAndConditions.lookupByOrg.map(
        (term) => ({
          id: term.id,
          title: term.title,
          description: term.description,
          type: term.type,
          orgId: term.orgId,
          isRequired: term.isRequired,
        })
      );
      setTerms(formattedData);
    }
  }, [termsData]);

  //getting fields of the form opened using form id
  const {
    loading: fieldsLoading,
    error: fieldsError,
    data: fieldsData,
  } = useQuery(GetFieldsByFormId, {
    variables: { formId: formId },
  });

  //this useEffect filters fields and sets them in the formFields state
  useEffect(() => {
    if (fieldsData?.organizationForms?.getItems?.data) {
      const filteredFields = fieldsData.organizationForms.getItems.data.map(
        (field) => {
          //if the coming in field is an editable field
          if (field.type === "client") {
            //for text fields (static text) the field.value will hold the text to be rendered
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
              //for the list type field, the values will come in as array as it is a list (e.g. hobbies, languages)
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
              //for the rest of the editable fields, value is an empty string
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
            //if the field is a term (terms and conditions of the organization)
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
      //setting the form fields state, with static fields called credentials (firstname, lastname etc.)
      const updatedFormFields = [staticFields, ...filteredFields];
      setFormFields(updatedFormFields);
    } else {
      //if the form has no fields in the backend, only the static fields will be shown in the form
      const emptyForm = [staticFields];
      setFormFields(emptyForm);
    }
  }, [fieldsData]);

  //to open terms and conditions modal
  const {
    isOpen: isOpenTerms,
    onOpen: onOpenTerms,
    onClose: onCloseTerms,
  } = useDisclosure();

  //to open and close add-field drawer
  const {
    isOpen: isOpenAddField,
    onOpen: onOpenAddField,
    onClose: onCloseAddField,
  } = useDisclosure();

  //update required flag of a field
  const [updateCustomerField] = useMutation(UpdateCustomerField);

  //map fields inside the form based on their type
  const mapDynamicFields = (field, index) => {
    //terms and conditions will be rendered as a link and a checkbox, clicking the link will open a modal
    if (field.type === "term") {
      return (
        <Flex width='100%' alignItems='flex-start' key={index}>
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
          <Box w='3%'>
            <CloseIcon
              onClick={() => {
                handleDeleteField(index);
              }}
            />
          </Box>
        </Flex>
      );
      //editable fields will be rendered as below:
    } else if (field.type === "client") {
      switch (field.data.inputType.value) {
        //for credentials such as firstname, lastname, email, phonenumber and location
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
                  required
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
        //for string type editable fields
        case FieldDatatypeEnum.String:
          return (
            <Flex width='100%' alignItems='flex-start'>
              <Box w='97%'>
                <LabeledInput
                  key={index}
                  label={field.data.name}
                  labelSize='h7'
                  placeholder={`Enter Your ${field.data.name}`}
                  type='text'
                />
              </Box>
              <Box w='3%' h='auto'>
                <CloseIcon
                  onClick={() => {
                    //deletes the field from the form
                    handleDeleteField(index);
                  }}
                />
              </Box>
            </Flex>
          );
        //number type field
        case FieldDatatypeEnum.Number:
          return (
            <Flex width='100%' alignItems='flex-start'>
              <Box w='97%'>
                <LabeledInput
                  key={index}
                  label={field.data.name}
                  labelSize='h7'
                  placeholder={`Enter Your ${field.data.name}`}
                  type='number'
                />
              </Box>
              <Box w='3%'>
                <CloseIcon
                  onClick={() => {
                    handleDeleteField(index);
                  }}
                />
              </Box>
            </Flex>
          );
        //boolean type field will show a checkbox
        case FieldDatatypeEnum.Boolean:
          return (
            <Flex width='100%' alignItems='flex-start' key={index}>
              <HStack gap='8px' w='97%'>
                <Text alignSelf='flex-start' fontSize='h7'>
                  {field.data.name}
                </Text>
                <Checkbox defaultChecked></Checkbox>
              </HStack>
              <Box w='3%'>
                <CloseIcon
                  onClick={() => {
                    handleDeleteField(index);
                  }}
                />
              </Box>
            </Flex>
          );
        //signature type field will show the custom made signature pad
        case FieldDatatypeEnum.Signature:
          return (
            <Flex width='100%' key={index} alignItems='flex-start'>
              <VStack spacing='8px' w='97%'>
                <Text alignSelf='flex-start' fontSize='h7'>
                  {field.data.name}
                </Text>
                <Signature />
              </VStack>
              <Box w='3%'>
                <CloseIcon
                  onClick={() => {
                    handleDeleteField(index);
                  }}
                />
              </Box>
            </Flex>
          );
        //static text type field shows a text area and a save button,
        //clicking on save button will show the static text as a bold paragraph for the text written in text area before saving
        case FieldDatatypeEnum.Text:
          return (
            <Flex w='100%' alignItems='flex-start'>
              <VStack
                width='97%'
                spacing='8px'
                key={index}
                alignItems='flex-start'
                justifyContent='space-between'
              >
                <Box w='95%'>
                  {index === editText ? (
                    <Textarea
                      defaultValue={field.data.value}
                      onChange={(event) => {
                        let value;
                        value = event.target.value;
                        field.data.value = value;
                      }}
                    />
                  ) : (
                    <Text fontWeight='semibold' fontSize='p5'>
                      {field.data.value?.length > 0
                        ? field.data.value
                        : "Add Text"}
                    </Text>
                  )}
                </Box>
                <Box>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => {
                      editText === index ? setEditText("") : setEditText(index);
                    }}
                  >
                    {editText === index ? "Save" : "Edit"}
                  </Button>
                </Box>
              </VStack>
              <Box w='3%'>
                <CloseIcon
                  onClick={() => {
                    handleDeleteField(index);
                  }}
                />
              </Box>
            </Flex>
          );
        //list type field will show stack of inputs to create a list, the delete and add more fields buttons are also there
        case FieldDatatypeEnum.List:
          return (
            <Flex width='100%' alignItems='flex-start'>
              <Box w='97%'>
                <Box width='100%' key={index}>
                  <Text fontSize='h7' alignSelf='flex-start'>
                    {field.data.name}
                  </Text>
                  <VStack w='100%' spacing='4px'>
                    {field.data.value.length > 0 &&
                      field.data.value.map((value, i) => (
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
                            //to delete an item from the list
                            onClick={() => {
                              setFormFields((prev) => {
                                return prev.map((list) => {
                                  if (list.sorting_index === index) {
                                    if (
                                      i === 0 &&
                                      list.data.value.length === 1
                                    ) {
                                      props.handleDeleteField(index);
                                      return;
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
                      //to add an item in the list
                      const updatedFields = formFields!.map((field) => {
                        if (field.sorting_index === index) {
                          const elementAdded = [...field.data.value, ""];
                          return {
                            ...field,
                            data: { ...field.data, value: elementAdded },
                          };
                        }
                        return field;
                      });
                      setFormFields(updatedFields);
                    }}
                  />
                </Box>
              </Box>
              <Box w='3%' h='auto'>
                <CloseIcon
                  onClick={() => {
                    handleDeleteField(index);
                  }}
                />
              </Box>
            </Flex>
          );
        //for date/time fields
        case FieldDatatypeEnum.Date:
        case FieldDatatypeEnum.Datetime:
          return (
            <Flex width='100%' alignItems='flex-start'>
              <Box w='97%'>
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
              </Box>
              <Box w='3%' h='auto'>
                <CloseIcon
                  onClick={() => {
                    handleDeleteField(index);
                  }}
                />
              </Box>
            </Flex>
          );
      }
    }
  };

  //drag and drop functionality
  const onDragEnd = (result) => {
    //case: no destination
    //do nothing
    if (!result.destination) {
      return;
    }
    if (result.type === "DEFAULT") {
      //case: source = fieldsArea and destination = fieldsArea
      //update sorting order of the fields inside fieldsArea
      if (
        result.source.droppableId === "fieldsArea" &&
        result.destination.droppableId === "fieldsArea"
      ) {
        setFields &&
          setFields((prev) => {
            const [removed] = prev.splice(result.source.index, 1);
            prev.splice(result.destination.index, 0, removed);
            prev.map((option, index) => {
              option.sortingIndex = index;
            });
            return prev;
          });
        setUpdateOrder(() => {
          return (
            fields &&
            fields
              ?.filter((value) => value.id !== undefined && value.id !== null)
              .map((value) => value.id)
          );
        });
      }
      //case: source = fieldsArea and destination = formArea
      //add the dragged field in the formFields state at a specific index to map it
      if (
        result.source.droppableId === "fieldsArea" &&
        result.destination.droppableId === "formArea"
      ) {
        setFields &&
          setFields((prev) => {
            const [removed] = prev.splice(result.source.index, 1);
            setFormFields((prev) => {
              if (removed.inputType.value === FieldDatatypeEnum.List) {
                prev.splice(result.destination.index, 0, {
                  type: "client",
                  sorting_index: result.destination.index,
                  data: { ...removed, value: [""] },
                });
              } else {
                prev.splice(result.destination.index, 0, {
                  type: "client",
                  sorting_index: result.destination.index,
                  data: {
                    ...removed,
                    value: "",
                  },
                });
                if (removed.inputType.value === "TEXT") {
                  setEditText(result.destination.index);
                }
              }
              prev.map((option, index) => {
                option.sorting_index = index;
              });
              return prev;
            });
            prev.splice(result.source.index, 0, removed);
            return prev;
          });
      }
      //case: source = formArea and destination = formArea
      //update sorting order of the fields inside formArea
      if (
        result.source.droppableId === "formArea" &&
        result.destination.droppableId === "formArea"
      ) {
        setFormFields((prev) => {
          const [removed] = prev.splice(result.source.index, 1);
          prev.splice(result.destination.index, 0, removed);
          prev.map((option, index) => {
            option.sorting_index = index;
          });
          return prev;
        });
      }
      //case: source = formArea and destination = fieldsArea
      //do nothing
      if (
        result.source.droppableId === "formArea" &&
        result.destination.droppableId === "fieldsArea"
      ) {
        return;
      }
      //case: source = termsArea and destination = formArea
      //add that term and condition to the form
      if (
        result.source.droppableId === "termsArea" &&
        result.destination.droppableId === "formArea"
      ) {
        setTerms &&
          setTerms((prev) => {
            const [removed] = prev.splice(result.source.index, 1);
            setFormFields((prev) => {
              prev.splice(result.destination.index, 0, {
                type: "term",
                sorting_index: result.destination.index,
                data: { ...removed },
              });
              prev.map((option, index) => {
                option.sorting_index = index;
              });
              return prev;
            });
            prev.splice(result.source.index, 0, removed);
            return prev;
          });
      }
      //case: source = termsArea and destination = termsArea
      //do nothing
      if (
        result.source.droppableId === "termsArea" &&
        result.destination.droppableId === "termsArea"
      ) {
        return;
      }
      //case: source = formsArea and destination = termsArea
      //do nothing
      if (
        result.source.droppableId === "formArea" &&
        result.destination.droppableId === "termsArea"
      ) {
        return;
      }
      //case: source = fieldsArea and destination = termsArea
      //do nothing
      if (
        result.source.droppableId === "fieldsArea" &&
        result.destination.droppableId === "termsArea"
      ) {
        return;
      }
      //case: source = termsArea and destination = fieldsArea
      //do nothing
      if (
        result.source.droppableId === "termsArea" &&
        result.destination.droppableId === "fieldsArea"
      ) {
        return;
      }
    }
  };

  return (
    <Grid templateColumns='0.25fr 0.75fr' gap='8px'>
      <DragDropContext onDragEnd={onDragEnd}>
        {/* EDITABLE FIELDS & TERMS AND CONDITIONS */}
        <Box width='100%' backgroundColor='#F7F5F0' paddingBottom='8px'>
          <Flex padding='8px' justifyContent='left' alignItems='center'>
            <IoChevronBackCircleSharp
              size={30}
              color='black'
              onClick={() => setFormBuilder("")}
              style={{ cursor: "pointer" }}
            />
            <Text fontSize='h6' fontWeight='semibold' ml='8px'>
              Forms
            </Text>
          </Flex>
          <Card variant='ghost' style={ToolkitCardStyle}>
            <CardHeader padding='8px'>
              <Flex alignItems='center' justifyContent='space-between'>
                <Text fontSize='h6' fontWeight='semibold'>
                  Editable Fields
                </Text>
              </Flex>
            </CardHeader>
            <CardBody padding='4px'>
              <Box>
                <Droppable droppableId='fieldsArea'>
                  {(provided, snapshot) => (
                    <Box {...provided.droppableProps} ref={provided.innerRef}>
                      {fields?.map((value, index) => (
                        <Draggable
                          key={index}
                          draggableId={String("fieldsAreaField " + index + 22)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Accordion
                              allowToggle
                              borderBlock={"transparent"}
                              key={value.id}
                              id={value.id}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                boxShadow: snapshot.isDragging
                                  ? "0 0 .4rem #666"
                                  : "none",
                                background: snapshot.isDragging
                                  ? "rgba(255, 255, 255, 0.85)"
                                  : "none",
                                borderRadius: snapshot.isDragging
                                  ? "4px"
                                  : "none",
                              }}
                            >
                              <AccordionItem>
                                <AccordionButton
                                  h='55px'
                                  _expanded={{
                                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                                  }}
                                >
                                  <Flex w='100%' gap='8px'>
                                    <Box {...provided.dragHandleProps}>
                                      <MdOutlineDragIndicator size='22px' />
                                    </Box>
                                    <Text
                                      fontSize='h7'
                                      fontWeight='semibold'
                                      noOfLines={1}
                                      textAlign='left'
                                    >
                                      {value.name}
                                    </Text>
                                  </Flex>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel bg='white'>
                                  <VStack
                                    justifyContent='space-between'
                                    alignItems='flex-start'
                                  >
                                    <VStack alignItems={"left"} spacing='8px'>
                                      <Text fontSize='p7' fontWeight='semibold'>
                                        Details
                                      </Text>
                                      <Flex
                                        gap='8px'
                                        justifyContent='left'
                                        w='100%'
                                      >
                                        <Text fontSize='p6'>Type:</Text>
                                        <Text fontSize='p6' noOfLines={1}>
                                          {value.inputType?.label
                                            ? value.inputType.label
                                            : value.description === null
                                            ? ""
                                            : value.description}
                                        </Text>
                                      </Flex>
                                    </VStack>
                                    <VStack
                                      alignItems='left'
                                      spacing='8px'
                                      w='100%'
                                    >
                                      <Text fontSize='p7' fontWeight='semibold'>
                                        Controls
                                      </Text>
                                      <Flex
                                        justifyContent='space-between'
                                        w='100%'
                                      >
                                        <Text fontSize='p6'>
                                          {value.required
                                            ? "Required"
                                            : "Not Required"}
                                        </Text>
                                        {fields && (
                                          <HStack>
                                            <Text fontSize='p6'>Required</Text>
                                            <Switch
                                              size='sm'
                                              isChecked={value.required}
                                              onChange={() => {
                                                updateCustomerField({
                                                  variables: {
                                                    updatedBy: user!.value?.uid,
                                                    clientFieldDetail: {
                                                      id: value.id,
                                                      name: value.name,
                                                      datatype:
                                                        value.inputType?.value,
                                                      isRequired:
                                                        !value.required,
                                                      orgId:
                                                        user!.value
                                                          ?.organization?.id,
                                                      sortingIndex:
                                                        value.sortingIndex,
                                                    },
                                                  },
                                                });
                                                const updatedFields =
                                                  fields.map((field) => {
                                                    if (field.id === value.id) {
                                                      return {
                                                        ...field,
                                                        required:
                                                          !value.required,
                                                      };
                                                    }
                                                    return field;
                                                  });
                                                setFields(updatedFields);
                                              }}
                                            />
                                          </HStack>
                                        )}
                                      </Flex>
                                    </VStack>
                                  </VStack>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      <Box mt='8px'>
                        <FieldDrawer
                          scenario='createFields'
                          field={fieldForDrawer}
                          setField={setFieldForDrawer}
                          onOpen={onOpenAddField}
                          isOpen={isOpenAddField}
                          onClose={onCloseAddField}
                          fields={fields}
                        />
                      </Box>
                    </Box>
                  )}
                </Droppable>
              </Box>
            </CardBody>
          </Card>
          <Card variant='ghost' style={ToolkitCardStyle} mt='16px'>
            <CardHeader padding='8px'>
              <Flex alignItems='center' justifyContent='space-between'>
                <Text fontSize='h6' fontWeight='semibold'>
                  Terms and Conditions
                </Text>
              </Flex>
            </CardHeader>
            <CardBody padding='4px'>
              {termsLoading ? (
                <Box padding='3' bg='greys.400' width='100%' borderRadius='4px'>
                  <SkeletonText
                    mt='2'
                    noOfLines={5}
                    spacing='4'
                    skeletonHeight='2.5'
                  />
                </Box>
              ) : termsData.termsAndConditions.lookupByOrg.length > 0 ? (
                <Box>
                  <Droppable droppableId='termsArea'>
                    {(provided, snapshot) => (
                      <Box {...provided.droppableProps} ref={provided.innerRef}>
                        {terms?.map((value, index) => (
                          <Draggable
                            key={index}
                            draggableId={String("termsAreaTerm" + index + 22)}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Accordion
                                allowToggle
                                borderBlock={"transparent"}
                                key={value.id}
                                id={value.id}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  boxShadow: snapshot.isDragging
                                    ? "0 0 .4rem #666"
                                    : "none",
                                  background: snapshot.isDragging
                                    ? "rgba(255, 255, 255, 0.85)"
                                    : "none",
                                  borderRadius: snapshot.isDragging
                                    ? "4px"
                                    : "none",
                                }}
                              >
                                <AccordionItem>
                                  <AccordionButton
                                    h='55px'
                                    _expanded={{
                                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                                    }}
                                  >
                                    <Flex
                                      w='100%'
                                      gap='8px'
                                      alignItems='flex-start'
                                    >
                                      <Box {...provided.dragHandleProps}>
                                        <MdOutlineDragIndicator size='22px' />
                                      </Box>
                                      <Text
                                        fontSize='h7'
                                        fontWeight={"semibold"}
                                        noOfLines={1}
                                        textAlign={"left"}
                                      >
                                        {value.title}
                                      </Text>
                                    </Flex>
                                    <AccordionIcon />
                                  </AccordionButton>
                                  <AccordionPanel bg='white'>
                                    <HStack
                                      justifyContent='space-between'
                                      alignItems='flex-start'
                                    >
                                      <VStack alignItems={"left"} spacing='8px'>
                                        <Text
                                          fontSize='p7'
                                          fontWeight='semibold'
                                        >
                                          Title
                                        </Text>
                                        <Text fontSize='p6' noOfLines={3}>
                                          {value.title}
                                        </Text>
                                        <Text
                                          fontSize='p7'
                                          fontWeight='semibold'
                                        >
                                          Description
                                        </Text>
                                        <Text fontSize='p6' noOfLines={3}>
                                          {value.description
                                            ? value.description
                                            : "No Description"}
                                        </Text>
                                        <Text
                                          fontSize='p7'
                                          fontWeight='semibold'
                                        >
                                          Type
                                        </Text>
                                        <Text fontSize='p6' noOfLines={3}>
                                          {value.type}
                                        </Text>
                                        <Text
                                          fontSize='p6'
                                          fontWeight='semibold'
                                        >
                                          {value.isRequired
                                            ? "Compulsory"
                                            : "Not Compulsory"}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  </AccordionPanel>
                                </AccordionItem>
                              </Accordion>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Box>
              ) : (
                <Flex w='100%' alignItems='left' padding='16px'>
                  <Text fontSize='p6' fontWeight='normal'>
                    No Terms and Conditions found.
                  </Text>
                </Flex>
              )}
            </CardBody>
          </Card>
        </Box>
        {/* FORM */}
        <Card variant={"outline"} style={mainCardStyle}>
          <CardHeader padding='8px'>
            <Flex w='100%' justifyContent='space-between'>
              <Text fontSize='h5' fontWeight='semibold'>
                Form Builder
              </Text>
              <Button
                isLoading={updateFormFieldsLoading}
                onClick={() => {
                  const savedFields = formFields
                    ?.map((field, index) => {
                      if (index > 0) {
                        if (field.type === "client") {
                          if (
                            field.data.inputType.value ===
                            FieldDatatypeEnum.Text
                          ) {
                            return {
                              id: field.data.id,
                              sorting_index: field.sorting_index,
                              type: field.type,
                              value: field.data.value,
                            };
                          } else
                            return {
                              id: field.data.id,
                              sorting_index: field.sorting_index,
                              type: field.type,
                            };
                        } else if (field.type === "term") {
                          return {
                            id: field.data.id,
                            sorting_index: field.sorting_index,
                            type: field.type,
                          };
                        }
                      }
                    })
                    .filter((field) => field !== undefined);
                  const payLoad = {
                    id: formId,
                    itemsJson: {
                      data: savedFields,
                    },
                    updatedBy: user!.value!.uid,
                  };
                  updatedFormFields({
                    variables: payLoad,
                    onCompleted: (resp) => {
                      console.log("update items in a form resp: ", resp);
                      Swal.fire({
                        icon: "success",
                        title: "Saved",
                        text: "Form saved successfully",
                      });
                    },
                  });
                }}
              >
                Save
              </Button>
            </Flex>
          </CardHeader>
          <Divider width='100%' opacity={1} />
          <CardBody padding='16px' height='100%'>
            <Box>
              <form style={{ height: "100%" }}>
                <VStack height='auto'>
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
                  <Droppable droppableId='formArea'>
                    {(provided, snapshot) => (
                      <VStack
                        spacing='14px'
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        minHeight='65vh'
                        style={{
                          // Add visual cue styles based on the snapshot.isDraggingOver
                          backgroundColor: snapshot.isDraggingOver
                            ? "#F7F5F0"
                            : "transparent",
                          border: snapshot.isDraggingOver
                            ? "1px dashed #999"
                            : "none",
                          borderRadius: "4px",
                        }}
                      >
                        {formFields &&
                          formFields.length > 0 &&
                          formFields.map((field, index) => (
                            <Draggable
                              key={index}
                              draggableId={String("formField " + index + 22)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Flex
                                  w='100%'
                                  alignItems='center'
                                  justifyContent='center'
                                  key={index}
                                  id={field.id}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    boxShadow: snapshot.isDragging
                                      ? "0 0 .4rem #666"
                                      : "none",
                                    background: snapshot.isDragging
                                      ? "rgba(255, 255, 255, 0.85)"
                                      : "none",
                                    padding: snapshot.isDragging
                                      ? "8px"
                                      : "0px",
                                    height: snapshot.isDragging
                                      ? "auto"
                                      : "auto",
                                  }}
                                >
                                  <Box mr='8px' {...provided.dragHandleProps}>
                                    <MdOutlineDragIndicator size='14px' />
                                  </Box>
                                  <Box w='100%' h='100%'>
                                    {mapDynamicFields(field, index)}
                                  </Box>
                                </Flex>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </VStack>
                    )}
                  </Droppable>
                )}
              </form>
            </Box>
          </CardBody>
        </Card>
      </DragDropContext>
    </Grid>
  );
}

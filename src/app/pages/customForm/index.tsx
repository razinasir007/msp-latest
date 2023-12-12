import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Card,
  CardBody,
  VStack,
  Center,
  CardFooter,
  Spacer,
  Checkbox,
  SkeletonCircle,
  HStack,
  SkeletonText,
  IconButton,
  Button,
  useDisclosure,
  CardHeader,
  Image,
  Flex,
  Link,
  ModalOverlay,
  ModalContent,
  Modal,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { LabeledInput } from "../../components/shared/labeledInput";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { AddressInput } from "../../components/shared/addressInput";
import { FieldDatatypeEnum } from "../../../apollo/gql-types/graphql";
import { GetOrganizationLogo } from "../../../apollo/organizationQueries";
import { Signature } from "../../components/checkoutForm/signature";
import {
  GetFieldsByFormId,
  SaveFilledForm,
  SaveFilledIntakeForm,
} from "../../../apollo/formsQueries";
import { FormPdf } from "../../components/shared/formPdf/formPdf";
import Swal from "sweetalert2";
import { DecryptData } from "../../../constants";
const mspLogo = require("../../../assets/mspMain.png");
import { v4 as uuidv4 } from "uuid";
import { CreateContact, GetClient } from "../../../apollo/clientQueries";

const staticFields = {
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

const mainCardStyle = {
  padding: 5,
  width: "60%",
  borderRadius: "4px",
  borderColor: "greys.300",
  marginTop: "45px",
  marginBottom: "45px",
};

export default function CustomForm() {
  //getting the encrypted orgId and formId from url params
  const urlParams = new URLSearchParams(window.location.search);
  const formName = urlParams.get("formName");
  const [clientId, setClientId] = useState("");
  const [locId, setLocId] = useState("");
  const orgIdEncrypted = urlParams.get("orgId");
  const formIdEncrypted = urlParams.get("formId");
  const [formSubmissionLoader, setFormSubmissionLoader] = useState(false);
  useEffect(() => {
    if (formName && formName !== "INTAKE_FORM") {
      const clientIdEncrypted = urlParams.get("clientId");
      const clientID = DecryptData(clientIdEncrypted);
      setClientId(clientID);
      getClientInfo({
        variables: {
          userId: clientID,
        },
      });
    } else if (formName && formName === "INTAKE_FORM") {
      const locIdEncrypted = urlParams.get("locId");
      const LocID = DecryptData(locIdEncrypted);
      setLocId(LocID);
    }
  }, [formName]);
  //decrypting the orgId and formId
  const orgId = DecryptData(orgIdEncrypted);
  const formId = DecryptData(formIdEncrypted);
  const filledFormId = uuidv4();
  //only gets true when the form is submitted
  const [formSubmitted, setFormSubmitted] = useState(false);
  //these form values will used to make the pdf and save filled out form
  const [fieldValues, setFieldValues] = useState<any>([
    {
      name: "First Name",
      type: "client",
      dataType: "STRING",
      value: "",
    },
    {
      name: "Last Name",
      type: "client",
      dataType: "STRING",
      value: "",
    },
    {
      name: "Email",
      type: "client",
      dataType: "EMAIL",
      value: "",
    },
    {
      name: "Phone Number",
      type: "client",
      dataType: "NUMBER",
      value: "",
    },
    {
      name: "Location",
      type: "client",
      dataType: "STRING",
      value: "",
    },
  ]);
  //this state holds all the form fields coming in from the backend for a specific formId
  const [formFields, setFormFields] = useState<Array<any>>([staticFields]);
  //holds org logo
  const [orgLogo, setOrgLogo] = useState("");
  //holds org name
  const [orgName, setOrgName] = useState("");
  //this state carries the term being opened in the modal
  const [termOpened, setTermOpened] = useState({
    id: "",
    description: "",
    is_required: true,
    orgId: "",
    sorting_index: 1,
    title: "",
    type: "",
  });
  //to open and close add-field drawer
  const {
    isOpen: isOpenTerms,
    onOpen: onOpenTerms,
    onClose: onCloseTerms,
  } = useDisclosure();

  //getting org logo and name for the form
  const {
    loading: orgLogoLoading,
    error: orgLogoError,
    data: orgLogoData,
  } = useQuery(GetOrganizationLogo, {
    variables: { id: orgId },
  });

  //getting form fields from the backend
  const {
    loading: fieldsLoading,
    error: fieldsError,
    data: fieldsData,
  } = useQuery(GetFieldsByFormId, {
    variables: { formId: formId },
  });

  const [getClientInfo, { loading: clientLoading, data: ClientDetails }] =
    useLazyQuery(GetClient);

  useEffect(() => {
    if (ClientDetails?.clients?.lookupClient) {
      fieldValues[0].value = ClientDetails?.clients?.lookupClient.firstname;
      fieldValues[1].value = ClientDetails?.clients?.lookupClient.lastname;
      fieldValues[2].value = ClientDetails?.clients?.lookupClient.email;
      fieldValues[3].value = ClientDetails?.clients?.lookupClient.phoneNumber;
      fieldValues[4].value =
        ClientDetails?.clients?.lookupClient.billingAddress;
    }
  }, [ClientDetails]);

  const [
    saveFilledForm,
    {
      loading: saveFilledFormLoading,
      error: saveFilledFormError,
      data: saveFilledFormData,
    },
  ] = useMutation(SaveFilledForm);

  const [
    saveFilledIntakeForm,
    {
      loading: saveFilledIntakeFormLoading,
      error: saveFilledIntakeFormError,
      data: saveFilledIntakeFormData,
    },
  ] = useMutation(SaveFilledIntakeForm);

  const [
    CreateClient,
    {
      loading: createContactLoading,
      error: createConatctError,
      data: createContactData,
    },
  ] = useMutation(CreateContact);

  //setting the org logo and org name coming from the backend
  useEffect(() => {
    if (orgLogoData) {
      setOrgLogo(orgLogoData?.organizations?.lookup?.logo);
      setOrgName(orgLogoData?.organizations?.lookup?.name);
    }
  }, [orgLogoData]);

  //this runs when you submit the form
  //holds signature validation, other validations and sets the filled out form in the fieldValues state
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setFormSubmissionLoader(true);
    let signatureCheckFailed = false;
    const values = formFields
      .map((field, index) => {
        if (index > 0) {
          if (field.type === "client") {
            if (field.data.inputType.value === "SIGNATURE") {
              if (field.data.is_required) {
                if (field.data.value.length > 0) {
                  return {
                    name: field.data.name,
                    type: field.type,
                    dataType: field.data.inputType.value,
                    value: field.data.value,
                  };
                } else {
                  signatureCheckFailed = true; // Set the flag
                  Swal.fire({
                    icon: "error",
                    title: "Please provide your signature.",
                  });
                  return;
                }
              } else {
                return {
                  name: field.data.name,
                  type: field.type,
                  dataType: field.data.inputType.value,
                  value: field.data.value,
                };
              }
            } else
              return {
                name: field.data.name,
                type: field.type,
                dataType: field.data.inputType.value,
                value: field.data.value,
              };
          } else if (field.type === "term") {
            return {
              name: field.data.title,
              value: field.data.value,
              type: field.type,
            };
          }
        }
      })
      .filter((field) => field !== undefined);
    if (signatureCheckFailed) {
      return; // Exit the function
    }
    setFieldValues((prevFieldValues) => [...prevFieldValues, ...values]);
    //this flag envokes a function to create pdf in a useEffect
    setFormSubmitted(true);
  };

  //envokes when form is submitted to create a pdf of the submitted intake form
  //IntakeFormPdf component defines the structure of pdf, takes orgLogo, orgName, fieldValues as props, returns a blob of the pdf
  useEffect(() => {
    if (formSubmitted) {
      //immediately invoked function to generate a pdf after a form is submitted...
      (async function () {
        try {
          const pdfBlob = await FormPdf({
            orgLogo,
            orgName,
            fieldValues,
            formName,
          });
          //converts the blob into a file object
          const pdfFile = new File([pdfBlob], `${formName}.pdf`, {
            type: "application/pdf",
          });
          //send the pfd file to the backend here...
          if (formName !== "INTAKE_FORM") {
            saveFilledForm({
              variables: {
                createdBy: clientId,
                clientId: clientId,
                formType: formName?.replace(/_/g, " "),
                pdf: pdfFile,
                id: filledFormId,
              },
              onCompleted: (resp) => {
                Swal.fire({
                  icon: "success",
                  title: "Form submitted successfully.",
                  text: "Thank you.",
                });
                setFormSubmissionLoader(false);
              },
            });
          } else if (formName === "INTAKE_FORM") {
            let newClientId = uuidv4();
            const clientFirstName = fieldValues.find(
              (value) => value.name === "First Name"
            )?.value;
            const clientLastName = fieldValues.find(
              (value) => value.name === "Last Name"
            )?.value;
            const clientEmail = fieldValues.find(
              (value) => value.name === "Email"
            )?.value;
            const clientPhoneNumber = fieldValues.find(
              (value) => value.name === "Phone Number"
            )?.value;
            const clientBillingAddress = fieldValues.find(
              (value) => value.name === "Location"
            )?.value;

            const values = fieldValues.filter((value) => {
              if (
                ![
                  "First Name",
                  "Last Name",
                  "Phone Number",
                  "Email",
                  "Location",
                ].includes(value.name)
              ) {
                return value;
              }
            });

            CreateClient({
              variables: {
                createdBy: newClientId,
                client: {
                  firstname: clientFirstName,
                  lastname: clientLastName,
                  email: clientEmail,
                  phoneNumber: clientPhoneNumber,
                  billingAddress: clientBillingAddress,
                  mailAddress: clientBillingAddress,
                  // lastContactedAt: "",
                  orgId: orgId,
                  locId: locId,
                  id: newClientId,
                },
              },
              onCompleted: (resp) => {
                if (resp?.clients?.createClient === true) {
                  saveFilledIntakeForm({
                    variables: {
                      createdBy: newClientId,
                      clientId: newClientId,
                      formType: formName,
                      pdf: pdfFile,
                      id: filledFormId,
                      values: { data: values },
                    },
                    onCompleted: (resp) => {
                      setFormSubmissionLoader(false);
                      Swal.fire({
                        icon: "success",
                        title: "Form submitted successfully.",
                        text: "Thank you.",
                      });
                    },
                  });
                } else {
                  Swal.fire({
                    icon: "error",
                    title: "Client creation failed.",
                    text: "Refresh the page and try again!",
                  });
                }
              },
            });
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Form submission failed.",
            text: error,
          });
        }
      })();
    }
  }, [formSubmitted]);

  //setting fields coming in from the backend in formFields state
  //handles value types of the formFields from different types of fields e.g. client===fields and terms===terms&conditions, list has multiple values (array) etc.
  useEffect(() => {
    if (fieldsData?.organizationForms?.getItems?.data) {
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
            } else if (field.data.datatype === "BOOLEAN") {
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
                  value: false,
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
                  value: "",
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
                value: true,
              },
            };
            return newTerm;
          }
        }
      );
      const updatedFormFields = [staticFields, ...filteredFields];
      setFormFields(updatedFormFields);
    } else {
      const emptyForm = [staticFields];
      setFormFields(emptyForm);
    }
  }, [fieldsData]);

  //sets the provided signatures' values in the value property of the signauture type form fields...
  const saveSignatures = (field, img) => {
    setFormFields((prev) =>
      prev.map((ele) => {
        if (ele.sorting_index === field.sorting_index) {
          return {
            ...ele,
            data: {
              ...ele.data,
              value: img,
            },
          };
        } else return ele;
      })
    );
  };

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
                value={field.data.value}
                onChange={(event) => {
                  const updatedFields = formFields.map((ele) => {
                    if (ele.sorting_index === field.sorting_index) {
                      return {
                        ...ele,
                        data: {
                          ...ele.data,
                          value: event.target.checked,
                        },
                      };
                    } else return ele;
                  });
                  setFormFields(updatedFields);
                }}
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
                  required={true}
                  value={fieldValues[0].value}
                  loading={clientLoading}
                  onChange={(event) => {
                    const newValue = event.target.value;
                    const updatedFieldValues = [...fieldValues];
                    updatedFieldValues[0].value = newValue;
                    setFieldValues(updatedFieldValues);
                  }}
                />
                <LabeledInput
                  containerHeight='55px'
                  label='Last Name'
                  labelSize='p5'
                  name='lastname'
                  type='text'
                  placeholder='Enter Last Name'
                  required={true}
                  value={fieldValues[1].value}
                  loading={clientLoading}
                  onChange={(event) => {
                    const newValue = event.target.value;
                    const updatedFieldValues = [...fieldValues];
                    updatedFieldValues[1].value = newValue;
                    setFieldValues(updatedFieldValues);
                  }}
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
                  required={true}
                  value={fieldValues[2].value}
                  loading={clientLoading}
                  onChange={(event) => {
                    const newValue = event.target.value;
                    const updatedFieldValues = [...fieldValues];
                    updatedFieldValues[2].value = newValue;
                    setFieldValues(updatedFieldValues);
                  }}
                />
                <LabeledInput
                  containerHeight='55px'
                  label='Phone Number'
                  labelSize='p5'
                  placeholder='Enter Phone Number...'
                  name='phoneNumber'
                  type='Number'
                  required={true}
                  value={fieldValues[3].value}
                  loading={clientLoading}
                  onChange={(event) => {
                    const newValue = event.target.value;
                    const updatedFieldValues = [...fieldValues];
                    updatedFieldValues[3].value = newValue;
                    setFieldValues(updatedFieldValues);
                  }}
                />
              </HStack>
              <Box width='100%'>
                <AddressInput
                  label='Location'
                  labelSize='h7'
                  placeholder='Enter Location'
                  name='billingAddress'
                  value={{
                    label: fieldValues[4].value,
                    value: fieldValues[4].value,
                  }}
                  defaultValue={""}
                  loading={clientLoading}
                  handleLocationChange={(event) => {
                    const newValue = event.label;
                    const updatedFieldValues = [...fieldValues];
                    updatedFieldValues[4].value = newValue;
                    setFieldValues(updatedFieldValues);
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
                required={field.data.is_required}
                value={field.data.value}
                onChange={(event) => {
                  const updatedFields = formFields.map((ele) => {
                    if (ele.sorting_index === field.sorting_index) {
                      return {
                        ...ele,
                        data: {
                          ...ele.data,
                          value: event.target.value,
                        },
                      };
                    } else return ele;
                  });
                  setFormFields(updatedFields);
                }}
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
                required={field.data.is_required}
                value={field.data.value}
                onChange={(event) => {
                  const updatedFields = formFields.map((ele) => {
                    if (ele.sorting_index === field.sorting_index) {
                      return {
                        ...ele,
                        data: {
                          ...ele.data,
                          value: event.target.value,
                        },
                      };
                    } else return ele;
                  });
                  setFormFields(updatedFields);
                }}
              />
            </Flex>
          );
        case FieldDatatypeEnum.Boolean:
          return (
            <Flex width='100%' gap='8px' alignItems='flex-start' key={index}>
              <Text alignSelf='flex-start' fontSize='h7'>
                {field.data.name}
              </Text>
              <Checkbox
                value={field.data.value}
                onChange={(event) => {
                  const updatedFields = formFields.map((ele) => {
                    if (ele.sorting_index === field.sorting_index) {
                      return {
                        ...ele,
                        data: {
                          ...ele.data,
                          value: event.target.checked,
                        },
                      };
                    } else return ele;
                  });
                  setFormFields(updatedFields);
                }}
              ></Checkbox>
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
              <Signature saveSignatures={saveSignatures} field={field} />
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
                        required={field.data.is_required}
                        value={field.data.value[i]}
                        onChange={(event) => {
                          const updatedFields = formFields.map((ele) => {
                            if (ele.sorting_index === field.sorting_index) {
                              return {
                                ...ele,
                                data: {
                                  ...ele.data,
                                  value: field.data.value.map((val, ind) => {
                                    if (ind === i) {
                                      return event.target.value;
                                    } else {
                                      return val;
                                    }
                                  }),
                                },
                              };
                            } else return ele;
                          });
                          setFormFields(updatedFields);
                        }}
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
                          setFormFields((prev) => {
                            return prev.map((list) => {
                              if (list.sorting_index === index) {
                                if (i === 0 && list.data.value.length === 1) {
                                  // handleDeleteField(index);
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
                    const updatedFields = formFields.map((field) => {
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
                required={field.data.is_required}
                value={field.data.value}
                onChange={(event) => {
                  const updatedFields = formFields.map((ele) => {
                    if (ele.sorting_index === field.sorting_index) {
                      return {
                        ...ele,
                        data: {
                          ...ele.data,
                          value: event.target.value,
                        },
                      };
                    } else return ele;
                  });
                  setFormFields(updatedFields);
                }}
              />
            </Flex>
          );
      }
    }
  };

  return (
    <Box backgroundColor='#F7F5F0'>
      <Center>
        <Card style={mainCardStyle}>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <VStack>
                {orgLogoLoading ? (
                  <Box
                    padding='3'
                    boxShadow='lg'
                    bg='greys.400'
                    width='100%'
                    minH='150px'
                    maxH='150px'
                    minW='200px'
                    maxW='200px'
                    borderRadius='4px'
                  >
                    <SkeletonCircle size='12' mb='12px' />
                    <SkeletonText spacing='4' skeletonHeight='4' />
                  </Box>
                ) : orgLogoData ? (
                  <Image
                    src={`data:image/*;base64,${orgLogo}`}
                    w='200px'
                    h='150px'
                  />
                ) : (
                  <Image src={mspLogo} w='140px' h='70px' />
                )}
                {orgLogoLoading ? (
                  <Box
                    padding='3'
                    boxShadow='lg'
                    bg='greys.400'
                    minH='35px'
                    maxH='35px'
                    w='180px'
                    borderRadius='4px'
                  >
                    <SkeletonText
                      justifyContent='center'
                      noOfLines={1}
                      skeletonHeight='4'
                    />
                  </Box>
                ) : (
                  <VStack justifyContent='center'>
                    {orgName ? (
                      <Text fontSize='h3' fontWeight='semibold'>
                        {orgLogoData?.organizations?.lookup?.name}
                      </Text>
                    ) : (
                      <Text fontSize='h3' fontWeight='semibold'>
                        MyStudioPro
                      </Text>
                    )}
                    <Text fontSize='p4' fontWeight='medium'>
                      {formName!.replace(/_/g, " ")}
                    </Text>
                  </VStack>
                )}
              </VStack>
            </CardHeader>
            <CardBody padding='16px'>
              <VStack width='100%' spacing='15px'>
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
                  <VStack spacing='14px' height='auto' w='100%'>
                    {formFields &&
                      formFields.length > 0 &&
                      formFields.map((field, index) => (
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
                <Spacer flex='1' />
              </VStack>
            </CardBody>
            <CardFooter>
              <Button type='submit' isLoading={formSubmissionLoader}>
                Send
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Center>
    </Box>
  );
}

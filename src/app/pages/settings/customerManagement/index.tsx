import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Grid,
  GridItem,
  HStack,
  VStack,
  Text,
  Card,
  CardHeader,
  Divider,
  CardBody,
  Center,
  useDisclosure,
  Flex,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  SkeletonText,
  Tag,
  TagLabel,
  CardFooter,
  Spinner,
} from "@chakra-ui/react";

import { FieldDrawer } from "../../../components/settings/customerManagement/fieldDrawer";
import { useMutation, useQuery } from "@apollo/client";
import { EditableField, EditableTags } from "../../../components/interfaces";
import { FieldsCard } from "../../../components/settings/customerManagement/fieldsCard";
import {
  CheckCircleIcon,
  DeleteIcon,
  EditIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";
import {
  GetCustomerTagsByOrg,
  UpdateTagsSortingIndex,
} from "../../../../apollo/customerTagQueries";
import {
  GetCustomerFieldsByOrg,
  UpdateFieldsSortingIndex,
} from "../../../../apollo/customerFieldQueries";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import {
  FormBuilder,
  staticFields,
} from "../../../components/settings/customerManagement/formBuilder";
import { GetOrgLocs } from "../../../../apollo/organizationQueries";
import { FormPreviewModal } from "../../../components/settings/customerManagement/formPreviewModal";
import { DeleteForm, GetFormsByOrgId } from "../../../../apollo/formsQueries";
import { CreateFormTag } from "../../../components/settings/customerManagement/createForm";
import { EncryptData } from "../../../../constants";
import { SendFormInEmail } from "../../../components/settings/customerManagement/sendFormInEmail";
import { GetClientsByOrgId } from "../../../../apollo/clientQueries";
import { SelectClient } from "../../../components/settings/customerManagement/selectClient";
import { FaStar } from "react-icons/fa";
import { UserPermissions } from "../../../routes/permissionGuard";
import Swal from "sweetalert2";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

interface Form {
  id: string;
  name: string;
  locId: string;
  orgId: string;
  createdBy: string;
}

interface Location {
  id: string;
  address: string;
  name: string;
}

export default function CustomerManagement() {
  const { userPermissions } = useContext(UserPermissions);
  const user = useHookstate(globalState.user);
  const [fields, setFields] = useState<Array<EditableField>>([]);
  const [forms, setForms] = useState<Array<Form>>([]);
  const [deletedForm, setDeletedForm] = useState<string>("");
  const [locations, setLocations] = useState<Array<Location>>([]);
  const [formBuilder, setFormBuilder] = useState<string>("");
  const [formFields, setFormFields] = useState<Array<any>>([staticFields]);
  const [tags, setTags] = useState<Array<EditableTags>>([]);
  const [field, setField] = useState<EditableField>({
    id: "",
    name: "",
    inputType: {
      value: "",
      label: "",
    },
    required: false,
  });
  const [tag, setTag] = useState<EditableTags>({
    id: "",
    name: "",
    description: "",
  });

  const [fieldsOrder, setFieldsOrder] = useState<Array<string>>([]);
  const [tagsOrder, setTagsOrder] = useState<Array<string>>([]);
  const [clientsOptions, setClientsOptions] = useState([]);

  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const {
    isOpen: isOpen3,
    onOpen: onOpen3,
    onClose: onClose3,
  } = useDisclosure();
  const {
    isOpen: isOpen4,
    onOpen: onOpen4,
    onClose: onClose4,
  } = useDisclosure();

  const {
    loading: fieldsLoading,
    error: fieldsError,
    data: fieldsData,
  } = useQuery(GetCustomerFieldsByOrg, {
    variables: { orgId: user?.value?.organization?.id },
  });

  const {
    loading: tagsLoading,
    error: tagsError,
    data: tagsData,
  } = useQuery(GetCustomerTagsByOrg, {
    variables: { orgId: user?.value?.organization?.id },
  });

  const [
    updateFieldsSortingIndex,
    { loading: FSortIndLoading, error: FSortIndError, data: FSortIndData },
  ] = useMutation(UpdateFieldsSortingIndex, {
    refetchQueries: [GetCustomerFieldsByOrg],
  });

  const [
    updateTagsSortingIndex,
    { loading: TSortIndLoading, error: TSortIndError, data: TSortIndData },
  ] = useMutation(UpdateTagsSortingIndex, {
    refetchQueries: [GetCustomerTagsByOrg],
  });

  //get locations of the organization query
  const {
    loading: locationLoading,
    error: locationError,
    data: locationData,
    refetch: refetchLocations,
  } = useQuery(GetOrgLocs, {
    variables: { orgId: user!.value!.organization!.id },
  });

  const {
    loading: clientsLoading,
    error: clientsError,
    data: clientsData,
  } = useQuery(GetClientsByOrgId, {
    variables: { orgId: user!.value!.organization!.id },
  });
  useEffect(() => {
    if (clientsData) {
      const updatedClientsOptions = clientsData!.clients?.getClientsByOrg.map(
        (client) => ({
          value: client.id,
          label: client.fullname,
          email: client.email,
        })
      );
      setClientsOptions(updatedClientsOptions);
    }
  }, [clientsData]);

  //set locations coming from the backend
  useEffect(() => {
    if (locationData?.organizations?.lookup?.locations) {
      const parsedLocations = locationData.organizations.lookup.locations.map(
        (location) => ({
          id: location.id,
          address: location.address,
          name: location.name,
        })
      );
      setLocations(parsedLocations);
    }
  }, [locationData]);

  //get forms of organization query
  const {
    loading: formsLoading,
    error: formsError,
    data: formsData,
  } = useQuery(GetFormsByOrgId, {
    variables: { orgId: user!.value!.organization!.id },
  });

  //deete a form mutation
  const [
    deleteForm,
    {
      loading: deleteFormLoading,
      error: deleteFormError,
      data: deleteFormData,
    },
  ] = useMutation(DeleteForm);

  //setting forms coming from the backend
  useEffect(() => {
    if (formsData?.organizationForms?.lookupByOrganization) {
      const filteredForms =
        formsData.organizationForms.lookupByOrganization.map((form) => ({
          id: form.id,
          name: form.name,
          locId: form.locId,
          orgId: form.orgId,
          createdBy: form.createdBy,
        }));
      setForms(filteredForms);
    }
  }, [formsData]);

  let tempFields: any = [];
  let tempTags: any = [];

  // format the result returned from the query and set local state for FIELDS
  useEffect(() => {
    if (fieldsData) {
      fieldsData.clients.lookupClientFieldDetailsByOrg.map(
        (field) =>
          (tempFields[field.sortingIndex] = {
            id: field.id,
            name: field.name,
            inputType: {
              value: field.datatype,
              label: field.datatype,
            },
            required: field.isRequired,
            sortingIndex: field.sortingIndex,
          })
      );
      setFields(tempFields);
    }
  }, [fieldsData]);

  // format the result returned from the query and set local state for TAGS
  useEffect(() => {
    if (tagsData) {
      tagsData.clientTags.lookupClientTagDetailsByOrg.map(
        (tag) =>
          (tempTags[tag.sortingIndex] = {
            id: tag.id,
            name: tag.name,
            description: tag.description,
            sortingIndex: tag.sortingIndex,
            createdAt: tag.createdAt.slice(0, 10),
          })
      );
      setTags(tempTags);
    }
  }, [tagsData]);

  // this useEffect runs when the drawer is triggered
  // to edit a field. It updates the current array
  // with updated field for UI quick response
  useEffect(() => {
    const formattedData = fields.map((oldField) => {
      return oldField.id === field.id ? field : oldField;
    });
    setFields(formattedData);
  }, [isOpen3]);

  //delete a field from the form and resort after deleting
  const handleDeleteField = (deletedFieldIndex) => {
    setFormFields((prev) => {
      // Create a copy of the previous state array using the spread operator
      const updatedFields = [...prev];
      // Remove the field at the specified index from the copied array
      updatedFields.splice(deletedFieldIndex, 1);
      // Update the sorting_index property of each remaining field
      updatedFields.forEach((option, index) => {
        option.sorting_index = index;
      });
      // Return the updated array as the new state
      return updatedFields;
    });
  };

  return (
    <>
      <FieldDrawer
        scenario='editFields'
        field={field}
        setField={setField}
        isOpen={isOpen3}
        onClose={onClose3}
      />
      <FieldDrawer
        scenario='editTags'
        tag={tag}
        setTag={setTag}
        isOpen={isOpen4}
        onClose={onClose4}
      />
      <Box height='100%'>
        <Grid
          templateAreas={`"header"
                "content" 
                "footer"`}
          gridTemplateRows={"75px 1fr 61px"}
          gridTemplateColumns={"1fr"}
          h='100%'
        >
          <GridItem padding={"24px 24px 16px"} area={"header"}>
            <HStack justifyContent='space-between'>
              <Text fontSize='h2' fontWeight='semibold' lineHeight='35px'>
                Customer Management
              </Text>
            </HStack>
          </GridItem>
          <GridItem px='24px' paddingBottom='16px' area={"content"}>
            <Tabs colorScheme='black'>
              <TabList>
                <Tab>Fields</Tab>
                <Tab>Forms</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4}>
                    {/* Editable FIELDS Card Component */}
                    <Card variant='outline' style={mainCardStyle}>
                      <CardHeader padding='8px'>
                        <Flex
                          alignItems='center'
                          justifyContent='space-between'
                        >
                          <Text fontSize='h6' fontWeight='semibold'>
                            Editable Fields
                          </Text>
                          {fieldsOrder.length > 0 && (
                            <Flex
                              justifyContent='right'
                              alignItems='center'
                              onClick={() => {
                                updateFieldsSortingIndex({
                                  variables: {
                                    ids: fieldsOrder,
                                    updatedBy: user!.value?.uid,
                                  },
                                  onCompleted: (resp) => {
                                    alert("Field UPDATED Successfully");
                                    setFieldsOrder([]);
                                  },
                                });
                              }}
                              cursor='pointer'
                            >
                              <IconButton
                                isLoading={FSortIndLoading}
                                sx={{
                                  ":hover": {
                                    backgroundColor: "transparent",
                                  },
                                }}
                                variant='ghost'
                                height='fit-content'
                                aria-label='Update Fields'
                                icon={<CheckCircleIcon fontSize='18px' />}
                              />
                              <Text fontSize='p5'>Update</Text>
                            </Flex>
                          )}
                        </Flex>
                      </CardHeader>
                      <Divider width='100%' opacity={1} />
                      <CardBody padding='8px'>
                        <Center>
                          {fieldsLoading ? (
                            <Text fontSize='p4' fontWeight='normal'>
                              Loading Fields...
                            </Text>
                          ) : fieldsData?.clients?.lookupClientFieldDetailsByOrg
                              ?.length ? (
                            <FieldsCard
                              scenario='fieldsCard'
                              fields={fields}
                              setFields={setFields}
                              setField={setField}
                              onOpen={onOpen3}
                              setUpdateOrder={setFieldsOrder}
                            />
                          ) : (
                            // Default component to render if no editable fields have been created yet
                            <Text fontSize='p4' fontWeight='normal'>
                              No editable fields created yet
                            </Text>
                          )}
                        </Center>
                      </CardBody>
                      <Box width='100%' py='8px'>
                        <FieldDrawer
                          scenario='createFields'
                          field={field}
                          setField={setField}
                          onOpen={onOpen1}
                          isOpen={isOpen1}
                          onClose={onClose1}
                          fields={fields}
                          setFields={setFields}
                        />
                      </Box>
                    </Card>

                    {/* Editable TAGS Card Component */}
                    <Card variant='outline' style={mainCardStyle}>
                      <CardHeader padding='8px'>
                        <Flex
                          alignItems='center'
                          justifyContent='space-between'
                        >
                          <Text fontSize='h6' fontWeight='semibold'>
                            Tags
                          </Text>
                          {tagsOrder.length > 0 && (
                            <Flex
                              alignItems='center'
                              onClick={() => {
                                updateTagsSortingIndex({
                                  variables: {
                                    ids: tagsOrder,
                                    updatedBy: user!.value?.uid,
                                  },
                                  onCompleted: (resp) => {
                                    alert("Tags UPDATED Successfully");
                                    setTagsOrder([]);
                                  },
                                });
                              }}
                              cursor='pointer'
                            >
                              <IconButton
                                isLoading={TSortIndLoading}
                                sx={{
                                  ":hover": {
                                    backgroundColor: "transparent",
                                  },
                                }}
                                variant='ghost'
                                height='fit-content'
                                aria-label='Update Tags'
                                icon={<CheckCircleIcon fontSize='18px' />}
                              />
                              <Text fontSize='p5'>Update</Text>
                            </Flex>
                          )}
                        </Flex>
                      </CardHeader>
                      <Divider width='100%' opacity={1} />
                      <CardBody padding='8px'>
                        <Center>
                          {tagsLoading ? (
                            <Text fontSize='p4' fontWeight='normal'>
                              Loading Tags...
                            </Text>
                          ) : tagsData?.clientTags?.lookupClientTagDetailsByOrg
                              ?.length ? (
                            <FieldsCard
                              scenario='tagsCard'
                              tags={tags}
                              setTags={setTags}
                              setTag={setTag}
                              onOpen={onOpen4}
                              setUpdateOrder={setTagsOrder}
                            />
                          ) : (
                            // Default component to render if no editable fields have been created yet
                            <Text fontSize='p4' fontWeight='normal'>
                              No editable tags created yet
                            </Text>
                          )}
                        </Center>
                      </CardBody>
                      <Box width='100%' py='8px'>
                        <FieldDrawer
                          scenario='createTags'
                          tag={tag}
                          setTag={setTag}
                          onOpen={onOpen2}
                          isOpen={isOpen2}
                          onClose={onClose2}
                          tags={tags}
                          setTags={setTags}
                        />
                      </Box>
                    </Card>
                  </VStack>
                </TabPanel>
                <TabPanel bg='#F7F5F0'>
                  {formBuilder.length > 0 ? (
                    <>
                      {fieldsLoading ? (
                        <Center>
                          <Text fontSize='p4' fontWeight='normal'>
                            Loading Fields...
                          </Text>
                        </Center>
                      ) : fieldsData?.clients?.lookupClientFieldDetailsByOrg
                          ?.length ? (
                        <FormBuilder
                          formFields={formFields}
                          setFormFields={setFormFields}
                          fields={fields}
                          setFields={setFields}
                          setUpdateOrder={setFieldsOrder}
                          handleDeleteField={handleDeleteField}
                          formId={formBuilder}
                          setFormBuilder={setFormBuilder}
                        />
                      ) : (
                        // Default component to render if no editable fields have been created yet
                        <Center>
                          <Text fontSize='p4' fontWeight='normal'>
                            No editable fields created yet. Add new...
                          </Text>
                          <FieldDrawer
                            scenario='createFields'
                            field={field}
                            setField={setField}
                            onOpen={onOpen1}
                            isOpen={isOpen1}
                            onClose={onClose1}
                            fields={fields}
                            setFields={setFields}
                          />
                        </Center>
                      )}
                    </>
                  ) : (
                    <>
                      {locationLoading ? (
                        <Box
                          padding='6'
                          boxShadow='lg'
                          bg='greys.400'
                          width='100%'
                          minH='235px'
                          maxH='235px'
                          mt='20px'
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
                        <SimpleGrid columns={2} spacing='20px'>
                          {locations.length > 0 &&
                            locations.map((ele, index) => {
                              return (
                                <Card
                                  variant='outline'
                                  style={mainCardStyle}
                                  key={index}
                                >
                                  <CardHeader>
                                    <Text fontSize='h7' fontWeight='semibold'>
                                      {ele.address}
                                    </Text>
                                  </CardHeader>
                                  <Divider width='100%' opacity={1} />
                                  <CardBody>
                                    <VStack>
                                      <>
                                        {formsLoading ? (
                                          <Box
                                            padding='3'
                                            bg='greys.400'
                                            width='100%'
                                            borderRadius='4px'
                                          >
                                            <SkeletonText
                                              mt='2'
                                              noOfLines={5}
                                              spacing='4'
                                              skeletonHeight='2.5'
                                            />
                                          </Box>
                                        ) : forms.length > 0 ? (
                                          forms.map(
                                            (form) =>
                                              form.locId === ele.id && (
                                                <Tag
                                                  width='100%'
                                                  size='lg'
                                                  variant='subtle'
                                                  colorScheme='blackAlpha'
                                                  backgroundColor='#F7F5F0'
                                                  borderRadius='full'
                                                  padding='16px'
                                                >
                                                  <Flex
                                                    w='100%'
                                                    justifyContent='space-between'
                                                    alignItems='center'
                                                  >
                                                    <TagLabel>
                                                      <HStack
                                                        spacing='8px'
                                                        alignItems={"center"}
                                                      >
                                                        {form.name ===
                                                          "INTAKE_FORM" ||
                                                        form.name ===
                                                          "CHECKOUT_FORM" ||
                                                        form.name ===
                                                          "PHOTOSHOOT_CONSENT_FORM" ? (
                                                          <FaStar
                                                            size={"12px"}
                                                            className={
                                                              "star filledBlack"
                                                            }
                                                          />
                                                        ) : (
                                                          <Box
                                                            boxSize={"12px"}
                                                          ></Box>
                                                        )}
                                                        <Text fontSize='p6'>
                                                          {/* /_/g, " " replaces "_" with spaces AT ALL OCCURENCES OF THE STRING */}
                                                          {form.name.replace(
                                                            /_/g,
                                                            " "
                                                          )}
                                                        </Text>
                                                      </HStack>
                                                    </TagLabel>
                                                    <HStack
                                                      spacing='16px'
                                                      alignItems='center'
                                                      height='100%'
                                                    >
                                                      {form.name !==
                                                        "CHECKOUT_FORM" && (
                                                        <>
                                                          {form.name ===
                                                          "INTAKE_FORM" ? (
                                                            <ExternalLinkIcon
                                                              onClick={() => {
                                                                const orgId =
                                                                  EncryptData(
                                                                    user!.value!
                                                                      .organization!
                                                                      .id
                                                                  );
                                                                const locId =
                                                                  EncryptData(
                                                                    user!.value!
                                                                      .storeLocId
                                                                  );
                                                                const formId =
                                                                  EncryptData(
                                                                    form.id
                                                                  );
                                                                const url = `/form?formName=${form.name}&orgId=${orgId}&locId=${locId}&formId=${formId}`;
                                                                window.open(
                                                                  url,
                                                                  "_blank"
                                                                );
                                                              }}
                                                            />
                                                          ) : (
                                                            <SelectClient
                                                              clientsOptions={
                                                                clientsOptions
                                                              }
                                                              clientsLoading={
                                                                clientsLoading
                                                              }
                                                              orgId={EncryptData(
                                                                user!.value!
                                                                  .organization!
                                                                  .id
                                                              )}
                                                              formId={EncryptData(
                                                                form.id
                                                              )}
                                                              formName={
                                                                form.name
                                                              }
                                                            />
                                                          )}

                                                          <SendFormInEmail
                                                            clientsOptions={
                                                              clientsOptions
                                                            }
                                                            clientsLoading={
                                                              clientsLoading
                                                            }
                                                            orgId={EncryptData(
                                                              user!.value!
                                                                .organization!
                                                                .id
                                                            )}
                                                            formId={EncryptData(
                                                              form.id
                                                            )}
                                                            formName={form.name}
                                                          />
                                                          <Divider
                                                            orientation='vertical'
                                                            height='20px'
                                                            border='outline'
                                                            opacity={1}
                                                          />
                                                        </>
                                                      )}
                                                      <EditIcon
                                                        onClick={() => {
                                                          if (
                                                            userPermissions.fullAccess ||
                                                            userPermissions.edit
                                                          ) {
                                                            setFormBuilder(
                                                              form.id
                                                            );
                                                          } else {
                                                            Swal.fire({
                                                              icon: "error",
                                                              title:
                                                                "Not Allowed",
                                                              text: "You are not allowed to make changes to this page",
                                                            });
                                                          }
                                                        }}
                                                      />
                                                      {deleteFormLoading &&
                                                      deletedForm ===
                                                        form.id ? (
                                                        <Spinner />
                                                      ) : (
                                                        <DeleteIcon
                                                          onClick={() => {
                                                            if (
                                                              userPermissions.fullAccess ||
                                                              userPermissions.delete
                                                            ) {
                                                              setDeletedForm(
                                                                form.id
                                                              );
                                                              deleteForm({
                                                                variables: {
                                                                  id: form.id,
                                                                },
                                                                onCompleted: (
                                                                  resp
                                                                ) => {
                                                                  const updatedForms =
                                                                    forms.filter(
                                                                      (ele) =>
                                                                        ele.id !==
                                                                        form.id
                                                                    );
                                                                  setForms(
                                                                    updatedForms
                                                                  );
                                                                },
                                                              });
                                                            } else
                                                              Swal.fire({
                                                                icon: "error",
                                                                title:
                                                                  "Not Allowed",
                                                                text: "You are not allowed to make changes to this page",
                                                              });
                                                          }}
                                                        />
                                                      )}
                                                      <FormPreviewModal
                                                        formFields={formFields}
                                                        setFormFields={
                                                          setFormFields
                                                        }
                                                        handleDeleteField={
                                                          handleDeleteField
                                                        }
                                                        formId={form.id}
                                                      />
                                                    </HStack>
                                                  </Flex>
                                                </Tag>
                                              )
                                          )
                                        ) : (
                                          <Text>No forms found.</Text>
                                        )}
                                      </>
                                    </VStack>
                                  </CardBody>
                                  <CardFooter>
                                    <Flex w='100%' justifyContent='left'>
                                      <CreateFormTag
                                        user={user}
                                        locId={ele.id}
                                        forms={forms}
                                        setForms={setForms}
                                      />
                                    </Flex>
                                  </CardFooter>
                                </Card>
                              );
                            })}
                        </SimpleGrid>
                      )}
                    </>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </GridItem>
        </Grid>
      </Box>
    </>
  );
}

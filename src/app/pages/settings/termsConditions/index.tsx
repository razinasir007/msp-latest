import React, { useEffect, useState, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  GridItem,
  HStack,
  CardBody,
  Card,
  Grid,
  Text,
  Button,
  Center,
  VStack,
  Textarea,
  IconButton,
  Flex,
  CardHeader,
  Divider,
  SkeletonCircle,
  SkeletonText,
  Checkbox,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { AddIcon, CheckIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import Swal from "sweetalert2";
import { LabeledInput } from "../../../components/shared/labeledInput";
import { AddTerms } from "../../../components/settings/termsConditions/addTerms";
import { TermsAndConditions } from "../../../components/interfaces";
import {
  CreateTermsConditions,
  DeleteTermsConditions,
  GetTermsConditions,
  UpdateTermsConditions,
} from "../../../../apollo/termsConditionsQueries";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { UserPermissions } from "../../../routes/permissionGuard";

//main card style for the page
//imported and used in addTerms component as well
export const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export default function TermsConditions() {
  //flag to cancel adding terms
  const [cancel, setCancel] = useState<boolean>(false);
  //to handle loading icon of a specific delete button, this works as a key
  const [deleteLoading, setDeleteLoading] = useState<string>("");
  //this state carries all the terms of an organization coming from the db
  const [terms, setTerms] = useState<TermsAndConditions[]>([]);
  //this state works as a key to handle which specific terms are being updated
  const [editTerm, setEditTerm] = useState<string>("");
  //getting the user id
  const user = useHookstate(globalState.user);
  const { userPermissions } = useContext(UserPermissions);

  //get terms and conditions query
  const {
    loading: termsLoading,
    error: termsError,
    data: termsData,
    refetch: loadTerms,
  } = useQuery(GetTermsConditions, {
    variables: { orgId: user!.value?.organization?.id },
  });

  //create terms and conditions mutation
  const [
    createTermsConditions,
    {
      loading: createTermsLoading,
      error: createTermsError,
      data: createTermsData,
    },
  ] = useMutation(CreateTermsConditions, {});

  //update terms and conditions mutation
  const [
    updateTermsConditions,
    {
      loading: updateTermsLoading,
      error: updateTermsError,
      data: updateTermsData,
    },
  ] = useMutation(UpdateTermsConditions, {});

  //delete terms and conditions mutation
  const [
    deleteTermsConditions,
    {
      loading: deleteTermsLoading,
      error: deleteTermsError,
      data: deleteTermsData,
    },
  ] = useMutation(DeleteTermsConditions, {});

  //setting terms and conditions into terms state on first render, when termsData is changed and when cancel is clicked
  useEffect(() => {
    if (termsData) {
      const formattedData = termsData.termsAndConditions.lookupByOrg.map(
        (term) => ({
          id: term.id,
          title: term.title,
          type: term.type,
          description: term.description,
          orgId: term.orgId,
          isRequired: term.isRequired,
        })
      );
      setTerms(formattedData);
    }
  }, [termsData, cancel]);

  //save a new term coming from the addTerms component
  const handleSave = (newTerm, closeAddTermsModalCallback) => {
    createTermsConditions(newTerm).then((val) => {
      if (val.data) {
        closeAddTermsModalCallback();
        loadTerms();
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Terms and Conditions saved successfully",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      }
    });
  };

  //delete a term
  const handleDelete = (term) => {
    {
      setDeleteLoading(term.id);
      deleteTermsConditions({
        variables: {
          id: term.id,
        },
      }).then((val) => {
        if (val.data) {
          loadTerms();
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Terms and Conditions deleted successfully",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        }
      });
    }
  };

  //update a term
  const handleUpdate = (term) => {
    updateTermsConditions({
      variables: {
        updatedBy: user!.value?.uid,
        termAndCondition: {
          id: term.id,
          title: term.title,
          type: term.type,
          description: term.description,
          orgId: term.orgId,
          isRequired: term.isRequired,
        },
      },
    }).then((val) => {
      if (val.data.termsAndConditions.update === true) {
        loadTerms();
        Swal.fire({
          icon: "success",
          title: "Update",
          text: "Terms and Conditions updated successfully",
        });
        setEditTerm("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      }
    });
  };

  const filterTerms = (type) => {
    return terms.filter((term) => term.type === type).length > 0 ? (
      terms
        .filter((term) => term.type === type)
        .map((term, index) => (
          <Box width='100%' key={index}>
            {term.id !== editTerm ? (
              <Card marginTop='16px' variant='outline' style={mainCardStyle}>
                <CardHeader padding='16px'>
                  <HStack justifyContent='space-between'>
                    <Text fontSize='h6' fontWeight='normal' noOfLines={1}>
                      {term.title}
                    </Text>
                    <Checkbox disabled={true} isChecked={term.isRequired}>
                      Required
                    </Checkbox>
                  </HStack>
                </CardHeader>
                <Divider width='100%' opacity={1} />
                <CardBody padding='16px'>
                  <Box>
                    <Text fontSize='p5' fontWeight='normal' noOfLines={5}>
                      {term.description}
                    </Text>
                    <Flex align='left' marginTop='16px'>
                      {/* delete button */}
                      <IconButton
                        key={index}
                        isLoading={
                          term.id === deleteLoading && deleteTermsLoading
                        }
                        isDisabled={
                          userPermissions.fullAccess || userPermissions.delete
                            ? false
                            : true
                        }
                        fontSize='18px'
                        variant='unstyled'
                        aria-label='Delete Field'
                        sx={{
                          ":hover": {
                            backgroundColor: "#EAE8E9",
                          },
                        }}
                        onClick={() => handleDelete(term)}
                        icon={<DeleteIcon />}
                      />
                      {/* edit button */}
                      <IconButton
                        fontSize='18px'
                        variant='unstyled'
                        aria-label='Edit Field'
                        sx={{
                          ":hover": {
                            backgroundColor: "#EAE8E9",
                          },
                        }}
                        onClick={() => {
                          setEditTerm(term.id);
                        }}
                        icon={<EditIcon />}
                        isDisabled={
                          userPermissions.fullAccess || userPermissions.edit
                            ? false
                            : true
                        }
                      />
                    </Flex>
                  </Box>
                </CardBody>
              </Card>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(term);
                }}
              >
                <Card marginTop='16px' variant='outline' style={mainCardStyle}>
                  <CardHeader padding='16px'>
                    <Flex>
                      <Box width='90%'>
                        <LabeledInput
                          required={true}
                          label='Title'
                          placeholder='Title...'
                          onChange={(event) => {
                            term.title = event.target.value;
                            setTerms([...terms]);
                          }}
                          value={term.title}
                          name='title'
                        />
                      </Box>
                      <Checkbox
                        paddingTop='16px'
                        isChecked={term.isRequired}
                        onChange={(event) => {
                          term.isRequired = event.target.checked;
                          setTerms([...terms]);
                        }}
                      >
                        Required
                      </Checkbox>
                    </Flex>
                  </CardHeader>
                  <Divider width='100%' opacity={1} />
                  <CardBody padding='16px'>
                    <Box>
                      <Text fontSize={"p4"} fontWeight='normal'>
                        Description
                      </Text>
                      <Textarea
                        required={true}
                        height={`${5 * 1.49}em`} //specifying number of lines to be 5 by default
                        placeholder='Description...'
                        name='description'
                        _placeholder={{
                          fontSize: "14px",
                        }}
                        borderRadius='4px'
                        onChange={(event) => {
                          term.description = event.target.value;
                          setTerms([...terms]);
                        }}
                        value={term.description}
                      />
                    </Box>
                    <Box paddingTop='16px'>
                      {/* cancel button */}
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setCancel(!cancel);
                          setEditTerm("");
                        }}
                      >
                        Cancel
                      </Button>
                      {/* update button */}
                      <Button
                        leftIcon={<CheckIcon />}
                        isLoading={updateTermsLoading}
                        variant='solid'
                        marginLeft='16px'
                        size='sm'
                        type='submit'
                      >
                        Update
                      </Button>
                    </Box>
                  </CardBody>
                </Card>
              </form>
            )}
          </Box>
        ))
    ) : (
      <Center
        minH='235px'
        flexDirection='column'
        borderRadius='4px'
        border={"1px dashed #8A8A8A"}
        width='100%'
      >
        <Text fontSize='h5' fontWeight='semibold'>
        No Terms and Conditions under {type}
        </Text>
        <Text fontSize='p4' fontWeight='normal'>
          Add new Terms and Conditions
        </Text>
      </Center>
    );
  };

  return (
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
              Terms & Conditions
            </Text>
            {/* add button for when termsData is present */}
            {termsData?.termsAndConditions?.lookupByOrg?.length && (
              <AddTerms handleSave={handleSave} user={user!.value} createLoading={createTermsLoading} />
            )}
          </HStack>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <>
            {/* if terms are loading */}
            {termsLoading ? (
              <Box
                padding='6'
                boxShadow='lg'
                bg='greys.400'
                width='100%'
                minH='235px'
                maxH='235px'
                borderRadius='4px'
              >
                <SkeletonCircle
                  size='10'
                  startColor='greys.200'
                  endColor='greys.600'
                />
                <SkeletonText
                  mt='4'
                  noOfLines={5}
                  spacing='4'
                  skeletonHeight='5'
                />
              </Box>
            ) : // else if we have terms data having any terms
            //data will be shown in the following vertical stack
            termsData?.termsAndConditions?.lookupByOrg?.length ? (
              <>
                <Tabs colorScheme='black'>
                  <TabList>
                    <Tab>Appointment Terms</Tab>
                    <Tab>Studio Policies</Tab>
                    <Tab>Order Terms</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <VStack alignItems='flex-start' spacing='16px'>
                        {filterTerms("APPOINTMENT_TERMS")}
                      </VStack>
                    </TabPanel>
                    <TabPanel>
                      <VStack alignItems='flex-start' spacing='16px'>
                        {filterTerms("STUDIO_POLICIES")}
                      </VStack>
                    </TabPanel>
                    <TabPanel>
                      <VStack alignItems='flex-start' spacing='16px'>
                        {filterTerms("ORDER_TERMS")}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </>
            ) : (
              // no terms
              <Center
                minH='235px'
                flexDirection='column'
                borderRadius='4px'
                border={"1px dashed #8A8A8A"}
              >
                <Text fontSize='h5' fontWeight='semibold'>
                  No terms and conditions have been added
                </Text>
                <Text fontSize='p4' fontWeight='normal'>
                  Add new Terms and Conditions
                </Text>
                <Box paddingTop='16px'>
                  <AddTerms handleSave={handleSave} user={user!.value} createLoading={createTermsLoading} />
                </Box>
              </Center>
            )}
          </>
        </GridItem>
        {/* <GridItem padding={"10px"} area={"footer"}></GridItem> */}
      </Grid>
    </Box>
  );
}

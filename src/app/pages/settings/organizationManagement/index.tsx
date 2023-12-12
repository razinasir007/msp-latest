import React, { useContext, useEffect, useState } from "react";

import {
  Box,
  Grid,
  Text,
  GridItem,
  Divider,
  Flex,
  Button,
  Card,
  Image,
  CardBody,
  CardHeader,
  HStack,
  VStack,
  Center,
  SkeletonText,
  FormControl,
  FormLabel,
  Switch,
  SimpleGrid,
  Skeleton,
  IconButton,
  SkeletonCircle,
} from "@chakra-ui/react";

import { LabeledInput } from "../../../components/shared/labeledInput";
import { FaCamera } from "react-icons/fa";
import {
  GetLocationSalesTaxByLocId,
  GetOrganization,
  UpdateOrganization,
} from "../../../../apollo/organizationQueries";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { AddLocations } from "../../../components/settings/organizationManagement/addLocation";
import { AddressInput } from "../../../components/shared/addressInput";
import { UpdateLocation } from "../../../../apollo/helperQueries";
import { OrgDetails, LocationDetails } from "../../../components/interfaces";
import { useHookstate } from "@hookstate/core";
import { globalState, useGlobalState } from "../../../../state/store";
import { Dropper } from "../../../components/shared/dropper";
import { GiCancel } from "react-icons/gi";
import { AddDiscountCodes } from "../../../components/settings/organizationManagement/addDiscountCodes";
import { SelectDropdown } from "../../../components/shared/selectDropdown";
import { reminderDuration } from "../../../../constants";
import {
  CreateReminderTimes,
  GetReminderTimesByOrgId,
  UpdateReminderTimes,
} from "../../../../apollo/appointmentQueries";
import { UserPermissions } from "../../../routes/permissionGuard";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export default function OrganizationManagement() {
  const { userPermissions } = useContext(UserPermissions);
  const [orgDetails, setOrgDetails] = useState<OrgDetails>({
    orgName: "",
    orgEmail: "",
    phoneNumber: "",
    orgWebsite: "",
    logo: {},
    dueDatePolicy: 0,
    discountCheck: false,
    discountCodeCheck: false,
  });
  const [primaryLocation, setPrimaryLocation] = useState<LocationDetails>({});
  const [reset, setReset] = useState<boolean>(false);
  const [fileLength, setFileLength] = useState(0);
  const [file, setFile] = useState({});
  const [salesTaxDataState, setSalesTaxData] = useState([]);
  const [durations, setDurations] = useState([]);
  const [replace, setReplace] = useState(false);

  const state = useGlobalState();
  const duration = state.getReminderDuration();
  const user = useHookstate(globalState.user);
  let uploadedImages = state.getOrgImages();

  //create reminder durations
  const [
    CreateReminder,
    { loading: reminderLoading, error: reminderError, data: reminderData },
  ] = useMutation(CreateReminderTimes);

  //update reminders
  const [
    UpdateReminder,
    {
      loading: UpdateReminderLoading,
      error: UpdateReminderError,
      data: UpdateReminderData,
    },
  ] = useMutation(UpdateReminderTimes);

  //Get Reminder Durations
  const {
    loading: getReminderLoading,
    error: getReminderError,
    data: getReminderData,
    refetch: RefetchReminders,
  } = useQuery(GetReminderTimesByOrgId, {
    variables: { orgId: user!.value?.organization?.id },
  });

  //  get current users organization based on their ID
  const {
    loading: orgLoading,
    error: orgError,
    data: orgData,
    refetch: RefetchOrg,
  } = useQuery(GetOrganization, {
    variables: { userId: user!.value?.uid },
  });
  const [
    GetLocationSalesTax,
    { loading: salesTaxLoading, data: salesTaxData },
  ] = useLazyQuery(GetLocationSalesTaxByLocId);

  useEffect(() => {
    const fetchSalesTaxData = async () => {
      if (orgData) {
        const filteredLocations =
          orgData?.organizations.lookupByUser?.locations.filter(
            (location) => location.isPrimary !== true
          );

        try {
          const responses = await Promise.all(
            filteredLocations.map((location) =>
              GetLocationSalesTax({
                variables: {
                  locId: location.id,
                },
              })
            )
          );

          // Filter out any undefined responses

          // Update the salesTaxData state with the new data
          // Extract and filter sales tax data from the responses
          const salesTaxDataArray = responses.map(
            (response) => response?.data?.locationSalesTax
          );
          setSalesTaxData(salesTaxDataArray);
        } catch (error) {}
      } else {
        setSalesTaxData([]);
      }
    };

    fetchSalesTaxData();
  }, [orgData]);

  // set local states after data is fetched
  useEffect(() => {
    if (orgData && salesTaxDataState.length) {
      const locationsWithAdditionalData =
        orgData.organizations.lookupByUser?.locations.map(
          (location: LocationDetails) => {
            // Find the matching sales tax data in salesTaxData array based on the location ID (location.id)
            const matchingSalesTax = salesTaxDataState.find(
              (salesTax) => salesTax.lookup?.locId === location.id
            );

            // If matchingSalesTax is found and sales tax data is not null, update the salesTax property in the location object
            if (matchingSalesTax && matchingSalesTax.lookup !== null) {
              return {
                ...location,
                salesTax: matchingSalesTax.lookup.salesTaxPercentage,
              };
            } else {
              // If matchingSalesTax is not found or sales tax data is null, set salesTax to 0
              return {
                ...location,
                salesTax: 0,
              };
            }
          }
        );
      setOrgDetails({
        orgID: orgData.organizations.lookupByUser?.id,
        orgName: orgData.organizations.lookupByUser?.name,
        orgEmail: orgData.organizations.lookupByUser?.email,
        phoneNumber: orgData.organizations.lookupByUser?.phoneNumber,
        orgAddress: orgData.organizations.lookupByUser?.address,
        orgWebsite: orgData.organizations.lookupByUser?.website,
        // these are all the locations associated with the organization
        logo: orgData.organizations.lookupByUser?.logo,
        // locations: orgData.organizations.lookupByUser?.locations || [],
        locations: locationsWithAdditionalData || [],
        // the primary location of the organization stored as address in org record
        location: {
          label: orgData.organizations.lookupByUser?.address,
          value: { description: orgData.organizations.lookupByUser?.address },
        },
        dueDatePolicy: orgData.organizations.lookupByUser?.dueDatePolicy,
        discountCheck: orgData.organizations.lookupByUser?.discountCheck,
        discountCodeCheck:
          orgData.organizations.lookupByUser?.discountCodeCheck,
      });
      setPrimaryLocation(
        orgData.organizations.lookupByUser?.locations.filter(
          (location: LocationDetails) => location.isPrimary === true
        )
      );
    }
  }, [orgData, reset, salesTaxDataState]);

  useEffect(() => {
    if (getReminderData && getReminderData.appointments) {
      const extractedDurations =
        getReminderData.appointments.lookupReminderTimesByOrg.map(
          ({ label, value }) => ({ label, value })
        );
      setDurations(extractedDurations);
    }
  }, [getReminderData]);

  const [updateOrganization, updateOrganizationResponse] = useMutation(
    UpdateOrganization,
    {
      variables: {
        updatedBy: user!.value?.uid,
        org: {
          id: orgDetails.orgID,
          name: orgDetails.orgName,
          address: orgDetails.location
            ? orgDetails.location?.label
            : orgDetails.orgAddress,
          email: orgDetails.orgEmail,
          website: orgDetails.orgWebsite,
          phoneNumber: orgDetails.phoneNumber,
          discountCheck: orgDetails.discountCheck,
          discountCodeCheck: orgDetails.discountCodeCheck,
          dueDatePolicy: Number(orgDetails.dueDatePolicy),
          logoFile: file,
          logoExtension: file.name?.split(".")[1],
        },
      },
      onCompleted: (data) => {
        user.set((previousState) => {
          if (previousState?.organization) {
            previousState.organization.dueDatePolicy = Number(
              orgDetails.dueDatePolicy
            );
            previousState.organization.discountCheck = orgDetails.discountCheck;
            previousState.organization.discountCodeCheck =
              orgDetails.discountCodeCheck;
          }
          return previousState;
        });
        RefetchOrg();
      },
    }
  );

  const [updateLocation, updateLocationResponse] = useMutation(UpdateLocation, {
    variables: {
      updatedBy: user!.value?.uid,
      location: {
        id: primaryLocation?.length ? primaryLocation[0]?.id : null,
        name: orgDetails.orgName,
        address: orgDetails.location?.label,
        countryName: orgDetails.parsedLocation?.countryName,
        administrativeArea: orgDetails.parsedLocation?.administrativeArea,
        administrativeAreaLevel2:
          orgDetails.parsedLocation?.administrativeAreaLevel2,
        placeName: orgDetails.parsedLocation?.placeName,
        sublocality: orgDetails.parsedLocation?.sublocality,
        thoroughfareName: orgDetails.parsedLocation?.thoroughfareName,
        thoroughfareNumber: Number(
          orgDetails.parsedLocation?.thoroughfareNumber
        ),
        subUnitDesignator: orgDetails.parsedLocation?.subUnitDesignator,
        subUnitIdentifier: orgDetails.parsedLocation?.subUnitIdentifier,
        postalCode: orgDetails.parsedLocation?.postalCode,
        isPrimary: true,
      },
    },
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrgDetails({
      ...orgDetails,
      [event.target.name]: event.target.value,
    });
  };

  function handleLocationChange(location, parsedLocation) {
    orgDetails.orgAddress = location.label;
    orgDetails.parsedLocation = parsedLocation;
    orgDetails.location = location;
    setOrgDetails({ ...orgDetails });
  }
  const handleDropDownChange = (option) => {
    state.setReminderDuration(option);
    setDurations(option);
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
          <Text fontSize='h2' fontWeight='semibold' lineHeight='35px'>
            Organization Management
          </Text>
        </GridItem>

        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <VStack spacing='12px'>
            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Organization Profile
                </Text>
                <Text fontSize='p5' fontWeight='normal' paddingTop='4px'>
                  This will function as the companies main source of information
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />
              <CardBody padding='8px'>
                <VStack spacing='16px' alignItems='flex-start'>
                  {orgLoading ? (
                    <Box
                      padding='6'
                      boxShadow='lg'
                      bg='greys.400'
                      height='200px'
                      width='550px'
                      minH='200px'
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
                    <Box w='50%'>
                      <Text fontSize='p4'>Organization Logo</Text>
                      {!orgDetails.logo || replace ? (
                        <Dropper
                          height='200px'
                          width='550px'
                          setFile={setFile}
                          setFilesLen={setFileLength}
                          fileState={state.addOrgImage}
                        >
                          {uploadedImages.length === 0 ? (
                            <>
                              <FaCamera size={"40px"} />
                              <Text
                                fontSize='h7'
                                fontWeight='semibold'
                                textAlign='center'
                              >
                                Upload your Organization Logo
                              </Text>
                              <Text fontSize='p5'>
                                <strong>Upload</strong> a file or drag and drop
                              </Text>
                              <Text fontSize='p6'>
                                ZIP, PNG, JPEG, GIF up to 5MB
                              </Text>
                            </>
                          ) : (
                            <Flex height='200px' width='550px'>
                              <GiCancel
                                onClick={() =>
                                  state.removeOrgImage(uploadedImages[0])
                                }
                                size={20}
                                style={{ cursor: "pointer", margin: "5px" }}
                              />
                              <Image
                                src={uploadedImages[0].base64}
                                alt='img'
                                objectFit={"contain"}
                                height='100%'
                                width='100%'
                              />
                            </Flex>
                          )}
                        </Dropper>
                      ) : (
                        <Box marginTop='5px'>
                          <Center
                            border='1px solid lightgray'
                            borderRadius={"4px"}
                            height='200px'
                            width='550px'
                          >
                            <Image
                              src={`data:image/png;base64,${orgDetails.logo}`}
                              alt='img'
                              objectFit={"contain"}
                              height='100%'
                              width='100%'
                            />
                          </Center>
                          <Button
                            variant={"mspCustom"}
                            onClick={() => setReplace(true)}
                            marginTop='5px'
                            isDisabled={
                              userPermissions.fullAccess || userPermissions.edit
                                ? false
                                : true
                            }
                          >
                            Re-upload logo
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}

                  <HStack spacing='24px' width='100%'>
                    <LabeledInput
                      label='Organization Name'
                      placeholder='Organization Name...'
                      value={orgDetails.orgName}
                      loading={orgLoading}
                      name='orgName'
                      onChange={handleChange}
                      isReadOnly={
                        userPermissions.fullAccess || userPermissions.edit
                          ? false
                          : true
                      }
                    />
                    <LabeledInput
                      placeholder='Email...'
                      label='Email'
                      name='orgEmail'
                      value={orgDetails.orgEmail}
                      loading={orgLoading}
                      onChange={handleChange}
                      isReadOnly={
                        userPermissions.fullAccess || userPermissions.edit
                          ? false
                          : true
                      }
                    />
                    <LabeledInput
                      label='Phone Number'
                      placeholder='Phone Number...'
                      value={orgDetails.phoneNumber}
                      loading={orgLoading}
                      name='phoneNumber'
                      onChange={handleChange}
                      isReadOnly={
                        userPermissions.fullAccess || userPermissions.edit
                          ? false
                          : true
                      }
                    />
                  </HStack>

                  <HStack spacing='24px' width='100%'>
                    <AddressInput
                      label='Address'
                      placeholder='Address...'
                      name='orgAddress'
                      loading={orgLoading}
                      value={orgDetails.location}
                      defaultValue={orgDetails.orgAddress}
                      handleLocationChange={handleLocationChange}
                      isDisabled={
                        userPermissions.fullAccess || userPermissions.edit
                          ? false
                          : true
                      }
                    />
                    <LabeledInput
                      label='Website'
                      placeholder='Website...'
                      value={orgDetails.orgWebsite}
                      loading={orgLoading}
                      name='orgWebsite'
                      onChange={handleChange}
                      isReadOnly={
                        userPermissions.fullAccess || userPermissions.edit
                          ? false
                          : true
                      }
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
            {/* <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Due Date Policy
                </Text>
                <Text fontSize='p5' fontWeight='normal' paddingTop='4px'>
                  This is where the due date policy for the orders of your
                  business is set.
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />
              <CardBody padding='8px'>
                <Flex width='100%'>
                  <LabeledInput
                    type='number'
                    placeholder='Enter the number of days...'
                    value={orgDetails.dueDatePolicy}
                    loading={orgLoading}
                    name='dueDatePolicy'
                    onChange={handleChange}
                  />
                </Flex>
              </CardBody>
            </Card> */}
            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Orders & Appointments
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />
              <CardBody padding='8px'>
                <SimpleGrid columns={2} spacing={4}>
                  <VStack alignItems='left'>
                    <Text fontSize='h7' fontWeight='semibold'>
                      Due Date Policy
                    </Text>
                    <Text fontSize='p5' fontWeight='normal' paddingTop='4px'>
                      This is where the due date policy for the orders of your
                      business is set.
                    </Text>
                    <LabeledInput
                      type='number'
                      placeholder='Enter the number of days...'
                      value={orgDetails.dueDatePolicy}
                      loading={orgLoading}
                      name='dueDatePolicy'
                      onChange={handleChange}
                      isReadOnly={
                        userPermissions.fullAccess || userPermissions.edit
                          ? false
                          : true
                      }
                    />
                  </VStack>
                  <VStack alignItems='left'>
                    <Text fontSize='h7' fontWeight='semibold'>
                      Appointment Reminders
                    </Text>
                    <Text fontSize='p5' fontWeight='normal' paddingTop='4px'>
                      This is where you can configure the pre-appointment
                      reminder timing.
                    </Text>
                    <SelectDropdown
                      isDisabled={
                        userPermissions.fullAccess || userPermissions.edit
                          ? false
                          : true
                      }
                      containerHeight='55px'
                      labelSize='p4'
                      placeholder='Duration'
                      loading={getReminderLoading}
                      isMulti={true}
                      value={durations.map((ele) => ele)}
                      options={reminderDuration.map((ele) => ({
                        label: ele.label,
                        value: parseInt(ele.value),
                      }))}
                      onChange={handleDropDownChange}
                    />
                  </VStack>
                </SimpleGrid>
              </CardBody>
            </Card>
            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Discounts
                </Text>
                <Text fontSize='p5' fontWeight='normal' paddingTop='4px'>
                  This is where the discounts for the orders of your business is
                  set.
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />
              <CardBody>
                <HStack spacing={5} w='100%'>
                  <FormControl display='flex' alignItems='center'>
                    <FormLabel
                      htmlFor='discounts'
                      mb='0'
                      fontSize='h7'
                      fontWeight='semibold'
                    >
                      Enable Discounts?
                    </FormLabel>
                    {orgLoading ? (
                      <SkeletonCircle
                        size='8'
                        startColor='greys.200'
                        endColor='greys.600'
                      />
                    ) : (
                      <Switch
                        isDisabled={
                          userPermissions.fullAccess ||
                          userPermissions.create ||
                          userPermissions.edit
                            ? false
                            : true
                        }
                        isChecked={orgDetails.discountCheck}
                        id='discounts'
                        size='lg'
                        colorScheme='gray'
                        onChange={(e) => {
                          setOrgDetails((prevState) => ({
                            ...prevState,
                            discountCheck: e.target.checked,
                          }));
                        }}
                      />
                    )}
                  </FormControl>
                  <FormControl display='flex' alignItems='center'>
                    <FormLabel
                      htmlFor='discountCodes'
                      mb='0'
                      fontSize='h7'
                      fontWeight='semibold'
                    >
                      Enable Discount Codes?
                    </FormLabel>
                    {orgLoading ? (
                      <SkeletonCircle
                        size='8'
                        startColor='greys.200'
                        endColor='greys.600'
                      />
                    ) : (
                      <Switch
                        isDisabled={
                          userPermissions.fullAccess ||
                          userPermissions.create ||
                          userPermissions.edit
                            ? false
                            : true
                        }
                        isChecked={orgDetails.discountCodeCheck}
                        id='discountCodes'
                        size='lg'
                        colorScheme='gray'
                        onChange={(e) => {
                          setOrgDetails((prevState) => ({
                            ...prevState,
                            discountCodeCheck: e.target.checked,
                          }));
                        }}
                      />
                    )}
                  </FormControl>
                </HStack>
                <AddDiscountCodes />
              </CardBody>
            </Card>

            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Add Locations
                </Text>
                <Text fontSize='p5' fontWeight='normal' paddingTop='4px'>
                  These are additional locations to where your business may
                  reside.
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />

              <CardBody padding='8px'>
                <AddLocations
                  orgDetails={orgDetails}
                  loading={orgLoading}
                  salesTaxLoading={salesTaxLoading}
                />
              </CardBody>
            </Card>
          </VStack>
        </GridItem>

        <GridItem padding={"16px 24px"} area={"footer"} bg='greys.200'>
          <Flex justifyContent='end'>
            <Button
              mr={4}
              size='sm'
              variant='outline'
              onClick={() => setReset(!reset)}
              isDisabled={
                userPermissions.fullAccess || userPermissions.edit
                  ? false
                  : true
              }
            >
              Reset
            </Button>
            <Button
              size='sm'
              variant='solid'
              isDisabled={
                userPermissions.fullAccess || userPermissions.edit
                  ? false
                  : true
              }
              onClick={() => {
                updateOrganization();
                updateLocation();
                UpdateReminder({
                  variables: {
                    createdBy: user!.value?.uid,
                    orgId: user!.value?.organization?.id,
                    reminders: durations,
                  },
                  onCompleted: () => {
                    RefetchReminders();
                  },
                });
              }}
              isLoading={updateOrganizationResponse.loading}
              loadingText='Saving...'
              spinnerPlacement='start'
            >
              Save
            </Button>
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
}

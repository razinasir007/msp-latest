import React, { useEffect, useState } from "react";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import {
  Flex,
  Heading,
  Button,
  Box,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { GoDotFill } from "react-icons/go";
import { BillingInfo } from "../../pages/onBoarding/billingInfo";
import Payments from "../../pages/onBoarding/payments";
import Integrations from "../../pages/onBoarding/integrations";
import Invite from "../../pages/onBoarding/invite";
import CreateOrgForm from "./createOrg/CreateOrgForm";
import {
  CreateOrgDetails,
  EmployeeDetails,
  SubscriptionPlans,
} from "../interfaces";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";
import { useFirebaseAuth } from "../../auth";
import { GetSubscriptionPlans } from "../../../apollo/subscriptionPlan";
import {
  OboardingProfileUpdate,
  OnboardingService,
} from "../../../apollo/helperQueries";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import { useNavigate } from "react-router-dom";
import { UpdateUserOnboarded } from "../../../apollo/userQueries";
import Swal from "sweetalert2";
import { ProfilePage } from "../../pages/onBoarding/profilePage";
import { AssignRole } from "./roles/assignRole";
import {
  AssignUserRole,
  CreateDefaultRoles,
  GetRolePermissions,
} from "../../../apollo/permissionsQueries";
import { ROUTE_PATHS } from "../../../constants";

const orgId = uuidv4();
const locId = uuidv4();
const userLocId = uuidv4();

export const OnBoardingStepper = () => {
  //IN THIS CASE, USE FIREBASEAUTH BECUASE THE STATE CLEARS ON THE REDIRECT
  const { user } = useFirebaseAuth && useFirebaseAuth();
  const navigate = useNavigate();

  //We repopulate the state on auth change, so use this to populate data
  const state = useHookstate(globalState);
  const stateUser = state.user.get();

  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  const [error, setError] = useState(false);
  // const [showButtons, setShowButtons] = useState(true);

  const [userInfo, setUserInfo] = useState<EmployeeDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [orgDetails, setOrgDetails] = useState<CreateOrgDetails>({
    id: "",
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    logo: {},
    logoExtension: "",
    salesTax: 0,
    website: "",
  });
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlans[]
  >([
    {
      id: "",
      title: "",
      description: "",
      amount: 0,
      benefits: [],
      currency: "",
      intervalCount: 0,
      intervalUnit: "",
      cycleAmount: "0.00",
    },
  ]);

  const [finalPaymentIntent, setFinalPaymentIntent] = useState({});
  const [role, setRole] = useState<any>({
    id: "",
    name: "",
    description: "",
  });

  const [ProfileUpdate, ProfileUpdateResponse] = useMutation(
    OboardingProfileUpdate
  );

  const [OnboardingServie, OnboardingServiceResponse] =
    useMutation(OnboardingService);

  const [UpdateOnboarded, UpdateOnboardedRespone] =
    useMutation(UpdateUserOnboarded);

  const [assignUserRole, assignUserRoleResponse] = useMutation(AssignUserRole);
  const [
    getRolePermissions,
    { loading: rolePermissionsLoading, data: rolePermissionsData },
  ] = useLazyQuery(GetRolePermissions);
  const [createDefaultRoles, createDefaultRolesResponse] =
    useMutation(CreateDefaultRoles);

  //Get subscription plans details from BE
  useQuery(GetSubscriptionPlans, {
    onCompleted: (response) => {
      setSubscriptionPlans(response.payments.getSubscriptionPlans);
    },
    onError: (error) => {
      console.log("ERROR FETCHING SUBSCRIPTION PLANS", error);
    },
  });

  //Prepopulate as much user info as available
  // Update the organization details state if organization already exists
  useEffect(() => {
    if (stateUser) {
      setUserInfo({
        ...userInfo,
        firstName: stateUser.firstname,
        lastName: stateUser.lastname,
        phoneNumber: stateUser.phoneNumber,
        email: stateUser.email,
        address: stateUser.address,
      });
    }
    if (stateUser && stateUser.organization) {
      orgDetails.id = stateUser.organization.id;
      orgDetails.name = stateUser.organization.name;
      orgDetails.email = stateUser.organization.email;
      orgDetails.phoneNumber = stateUser.organization.phoneNumber;
      orgDetails.address = stateUser.organization.address;
      orgDetails.logo = stateUser.organization.logo;
      orgDetails.logoExtension =
        stateUser.organization.logo?.name?.split(".")[1];
      orgDetails.website = stateUser.organization.website;

      setOrgDetails({ ...orgDetails });
    }
    if (stateUser && stateUser.role && stateUser.role !== null) {
      setRole(stateUser.role);
    }
  }, [user]);

  const steps = [
    {
      label: "Complete your Profile",
      view: <ProfilePage userInfo={userInfo} setUserInfo={setUserInfo} />,
    },
    {
      label: "Create your Organization",
      view: (
        <CreateOrgForm
          createOrgDetails={orgDetails}
          setCreateOrgDetails={setOrgDetails}
        />
      ),
    },
    {
      label: "Assign a role",
      view: (
        <AssignRole
          orgId={stateUser?.organization?.id}
          role={role}
          setRole={setRole}
        />
      ),
    },
    {
      label: "Billing Info",
      view: (
        <BillingInfo
          subscriptionPlans={subscriptionPlans}
          userId={user?.uid}
          finalPaymentIntent={finalPaymentIntent}
          setFinalPaymentIntent={setFinalPaymentIntent}
        />
      ),
    },
    {
      label: "Payments",
      view: <Payments />,
    },
    {
      label: "Integrations",
      view: <Integrations />,
    },
    {
      label: "Invite",
      view: <Invite orgId={orgId} storeLocationId={locId} />,
    },
  ];

  const handleNext = (activeStep: number) => {
    switch (activeStep) {
      case 0:
        if (
          user &&
          userInfo.firstName &&
          userInfo.lastName &&
          userInfo.email &&
          userInfo.address &&
          userInfo.phoneNumber
        ) {
          ProfileUpdate({
            variables: {
              updatedBy: user!.uid,
              createdBy: user!.uid,
              user: {
                id: user!.uid,
                firstname: userInfo.firstName,
                lastname: userInfo.lastName,
                email: userInfo.email,
                address: userInfo.address,
                phoneNumber: userInfo.phoneNumber,
                isAdmin: true,
                storeLocId: locId,
              },
              location: {
                id: userLocId,
                name: `${userInfo.firstName} Personal Address`,
                address: userInfo.address,
                countryName: userInfo.parsedLocation?.countryName,
                administrativeArea: userInfo.parsedLocation?.administrativeArea,
                administrativeAreaLevel2:
                  userInfo.parsedLocation?.administrativeAreaLevel2,
                placeName: userInfo.parsedLocation?.placeName,
                sublocality: userInfo.parsedLocation?.sublocality,
                thoroughfareName: userInfo.parsedLocation?.thoroughfareName,
                thoroughfareNumber: Number(
                  userInfo.parsedLocation?.thoroughfareNumber
                ),
                subUnitDesignator: userInfo.parsedLocation?.subUnitDesignator,
                subUnitIdentifier: userInfo.parsedLocation?.subUnitIdentifier,
                postalCode: userInfo.parsedLocation?.postalCode,
              },
              userLocation: {
                locId: userLocId,
                userId: user!.uid,
              },
            },
            onCompleted: (resp) => {
              if (resp.users.update === true) {
                Swal.fire({
                  icon: "success",
                  titleText: "Profile Updated Successfully!",
                  text: "Continue the onboarding...",
                  confirmButtonText: "Continue",
                }).then(() => nextStep());
              } else {
                console.log("ERROR UPDATED THE USER");
              }
            },
            onError: (err) => {
              console.log("ERROR UPDATING USER::::::", err);
            },
          });
          setError(false);
        } else {
          setError(true);
        }
        break;

      case 1:
        //If a user has already created an organization and is continuing the onboarding process
        if (stateUser && stateUser.organization) {
          if (stateUser.role && stateUser.role !== null) {
            nextStep();
          } else
            createDefaultRoles({
              variables: {
                createdBy: stateUser!.uid,
                orgId: stateUser!.organization!.id,
              },
              onCompleted: (response) => {
                nextStep();
              },
            });
        }
        //User hasn't created an organization
        else if (
          user &&
          orgDetails.name &&
          orgDetails.email &&
          orgDetails.address &&
          orgDetails.phoneNumber &&
          orgDetails.website !== ""
        ) {
          setError(false);
          OnboardingServie({
            variables: {
              createdBy: user!.uid,
              updatedBy: user!.uid,
              user: {
                id: user!.uid,
                firstname: userInfo.firstName,
                lastname: userInfo.lastName,
                email: userInfo.email,
                address: userInfo.address,
                phoneNumber: userInfo.phoneNumber,
                isAdmin: true,
                storeLocId: locId,
              },
              org: {
                name: orgDetails.name,
                email: orgDetails.email,
                id: orgId,
                address: orgDetails.address,
                phoneNumber: orgDetails.phoneNumber,
                website: orgDetails.website,
                logoFile: orgDetails.logo,
                logoExtension: orgDetails.logo?.name?.split(".")[1],
              },
              userOrganization: { userId: user!.uid, orgId: orgId },
              location: {
                id: locId,
                name: `${orgDetails.name} Store Address`,
                email: orgDetails.email,
                phoneNumber: orgDetails.phoneNumber,
                address: orgDetails.address,
                countryName: orgDetails.parsedLocation?.countryName,
                administrativeArea:
                  orgDetails.parsedLocation?.administrativeArea,
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
              },
              locSalesTax: {
                locId: locId,
                salesTaxPercentage: parseFloat(orgDetails.salesTax),
              },
              organizationLocation: {
                locId: locId,
                orgId: orgId,
              },
            },
            onCompleted: (response) => {
              // console.log("Organization SERVICE Successfully", response);
              const updatedOrg = { ...orgDetails, id: orgId };
              state.user.set((prevState) => ({
                ...prevState,
                organization: updatedOrg,
                storeLocId: locId,
              }));
              if (
                response.organizations.create === true &&
                response.userOrganizations.create === true &&
                response.locations.create === true &&
                response.organizationLocations.create === true
              ) {
                createDefaultRoles({
                  variables: {
                    createdBy: stateUser!.uid,
                    orgId: stateUser!.organization!.id,
                  },
                  onCompleted: (response) => {
                    if (
                      response.dynamicRolesPermissions
                        .createDefaultRolesAndPermissions === true
                    ) {
                      nextStep();
                    } else {
                      Swal.fire({
                        icon: "error",
                        titleText: "Default Roles Creation",
                        text: "Please try again!",
                      });
                    }
                  },
                });
              }
            },
            onError: (err) => {
              console.log("Error creating organization: ", err);
            },
          });
        } else {
          setError(true);
        }
        break;

      case 2:
        if (role.id.length && stateUser && stateUser.organization) {
          setError(false);
          assignUserRole({
            variables: {
              roleId: role.id,
              setBy: stateUser!.uid,
              userId: stateUser!.uid,
            },
            onCompleted: (resp) => {
              if (resp.dynamicRolesPermissions.assignUserRole === true) {
                nextStep();
              } else {
                Swal.fire({
                  icon: "error",
                  titleText: "Error",
                  text: "Please try again!",
                });
                console.log("ERROR ASSIGNING THE ROLE");
              }
            },
            onError: (err) => {
              console.log("ERROR ASSIGNING ROLE TO USER::::::", err);
            },
          });
        } else {
          setError(true);
        }
        break;
      case 3:
        if (Object.keys(finalPaymentIntent).length > 0) {
          nextStep();
        }
        break;
      case 4:
        nextStep();
        break;
      case 5:
        nextStep();
        break;
      case 6:
        if (
          (stateUser && stateUser.isOnboarded === false) ||
          (stateUser && stateUser.isOnboarded === undefined)
        ) {
          UpdateOnboarded({
            variables: {
              id: user!.uid,
              isOnboarded: true,
            },
            onCompleted: (resp) => {
              if (resp.users.updateOnboarded === true) {
                getRolePermissions({
                  variables: {
                    id: role.id,
                  },
                  onCompleted: (resp) => {
                    state.user.set((prevState) => ({
                      ...prevState,
                      role: {
                        id: role.id,
                        name: role.name,
                        description: role.description,
                        permissions:
                          resp.dynamicRolesPermissions?.lookupPermissionByRole,
                      },
                      isOnboarded: true,
                    }));
                  },
                }).then(() => {
                  setOrgDetails({
                    id: "",
                    name: "",
                    email: "",
                    phoneNumber: "",
                    address: "",
                    logo: {},
                    logoExtension: "",
                    website: "",
                  });
                  Swal.fire({
                    icon: "success",
                    titleText: "Onboarding Successfull!",
                    text: "Thank you for signing up!",
                    confirmButtonText: "Continue to home...",
                  }).then(() =>
                    navigate(`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.DASHBOARD}`)
                  );
                });
              }
            },
            onError: (err) => {
              console.log("User Onborading Error: " + err);
            },
          });
          nextStep();
        } else {
          navigate(`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.DASHBOARD}`);
        }
        break;
    }
  };
  return (
    <Flex flexDir='column' height={"100%"} width='100%'>
      <Steps
        activeStep={activeStep}
        variant='circles'
        checkIcon={GoDotFill}
        size='sm'
        colorScheme=''
      >
        {steps.map(({ label, view }, index) => (
          <Step label={label} key={index} icon={GoDotFill}>
            {error ? (
              <Center>
                <Alert status='error'>
                  <AlertIcon />
                  <AlertTitle fontSize='p5'>Error while proceeding!</AlertTitle>
                  <AlertDescription>
                    Please enter all the reqiured details.
                  </AlertDescription>
                </Alert>
              </Center>
            ) : (
              <></>
            )}
            {view}
          </Step>
        ))}
      </Steps>

      <Box>
        {activeStep === steps.length ? (
          <Flex px={4} py={4} width='100%' flexDirection='column'>
            <Heading fontSize='xl' textAlign='center'>
              Hold on while we onboard you...
            </Heading>
          </Flex>
        ) : (
          <Flex width='100%' justify='right' py={2}>
            <Button
              isDisabled={activeStep === 0}
              mr={4}
              onClick={prevStep}
              size='sm'
              variant='outline'
            >
              Prev
            </Button>
            <Button
              isLoading={
                OnboardingServiceResponse.loading ||
                ProfileUpdateResponse.loading ||
                createDefaultRolesResponse.loading ||
                assignUserRoleResponse.loading
              }
              size='sm'
              variant='solid'
              onClick={() => {
                handleNext(activeStep);
              }}
            >
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

// {showButtons && (
//   )}

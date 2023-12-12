import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useContext,
} from "react";

import {
  Box,
  Center,
  Grid,
  Text,
  GridItem,
  Button,
  Card,
  CardBody,
  HStack,
  VStack,
  SkeletonCircle,
  SkeletonText,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";

import { useMutation, useQuery } from "@apollo/client";
import {
  DeleteUser,
  GetUsersByOrgId,
  UpdateUser,
  UpdateUserRole,
} from "../../../../apollo/userQueries";
import {
  AssignUserRole,
  GetGrantLevels,
} from "../../../../apollo/permissionsQueries";
import { GetRolesByOrgId } from "../../../../apollo/permissionsQueries";
import { FaUsers } from "react-icons/fa";
import { AddUser } from "../../../components/settings/userManagement/addUser";
import { OrgUsers } from "../../../components/interfaces";
import { AgGridPagination } from "../../../components/shared/agGridPagination";
import { ColDef, ColumnState } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { StatusOptions, appliedFilter } from "../../../../constants";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { TableDropdown } from "../../../components/shared/tableDropdown";
import { CustomOverlay } from "../../../components/shared/customOverlay";
import Search from "../../../components/shared/searchFilter";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "../../../styles/gridCustomStyles.css";

import {
  gridStyle,
  containerStyle,
  defaultColDef,
} from "../../../../constants/gridStyles";
import {
  externalFilter,
  externalFilterPresent,
  Filter,
} from "../../../components/shared/externalFilter";
import { statusComparator } from "../../../../helperFunctions";
import { GetOrgLocs } from "../../../../apollo/organizationQueries";
import { RolesManagement } from "../../../components/settings/userManagement/rolesManagement";
import { UserPermissions } from "../../../routes/permissionGuard";
import Swal from "sweetalert2";

function roleComparator(role1, role2) {
  if (role1?.value === role2?.value) {
    return 0; // both are same roles, no need to move them
  } else if (role1?.value < role2?.value) {
    return -1; // role1 is smaller, role2 is greater, move it above whatever is smaller: Acsending order
  } else {
    return 1; // role1 is greater, role2 is smaller, move it below: Descsending order
  }
}

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export default function UserManagement() {
  const { userPermissions } = useContext(UserPermissions);
  const [usersDetails, setUsersDetails] = useState<OrgUsers[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<OrgUsers[]>([]);
  const [rolesTab, setRolesTab] = useState(false);
  const [roles, setRoles] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  //for pagination
  const [windowApiReady, setWindowApiReady] = useState<Boolean>(false);
  const gridRef = useRef<AgGridReact>(null);

  const user = useHookstate(globalState.user);

  const {
    loading: usersLoading,
    error: usersError,
    data: usersData,
    refetch: loadUser,
  } = useQuery(GetUsersByOrgId, {
    variables: {
      orgId: user?.value?.organization?.id,
    },
  });

  // GET USER ROLES AND POPULATE DROPDOWN MENUS
  // useQuery(GetGrantLevels, {
  //   onCompleted: (allRoles) => {
  //     const roleOptions = allRoles.grantLevels.get.map((role) => ({
  //       value: role.grantLvl,
  //       label: role.name,
  //     }));
  //     setRoles(roleOptions);
  //   },
  // });
  const {
    loading: locationLoading,
    error: locationError,
    data: locationData,
  } = useQuery(GetOrgLocs, {
    variables: { orgId: user?.value?.organization?.id },
  });

  const [deleteUser, deleteUserResponse] = useMutation(DeleteUser);

  // const [updateUserRole, updateUserRoleResponse] = useMutation(UpdateUserRole);
  const [updateUserRole, updateUserRoleResponse] = useMutation(AssignUserRole);

  const [updateUser, updateUseResponse] = useMutation(UpdateUser);

  const {
    loading: rolesLoading,
    error: rolesError,
    data: rolesData,
  } = useQuery(GetRolesByOrgId, {
    variables: { orgId: user?.value?.organization?.id },
  });

  useEffect(() => {
    if (rolesData) {
      setRoles(rolesData?.dynamicRolesPermissions?.lookupRolesByOrganization);
      const updatedRoleOptions =
        rolesData?.dynamicRolesPermissions?.lookupRolesByOrganization.map(
          (role) => ({
            value: role.id,
            label: role.name,
          })
        );
      setRoleOptions(updatedRoleOptions);
    }
  }, [rolesData]);

  // set local states after data is fetched

  // useEffect(() => {
  //   if (usersData) {
  //     usersData.users.getByOrg.map((user) => {
  //       usersDetails["fullname"] = `${user.firstname} ${user.lastname}`;
  //       usersDetails["email"] = user.email;
  //       usersDetails["store"] = user.organization.address;
  //       setUsersDetails(usersDetails);
  //     });
  //   }
  // }, [usersData]);

  useEffect(() => {
    if (usersData && locationData && usersData.users.getByOrg !== null) {
      const formattedData = usersData.users.getByOrg.map((user) => ({
        id: user.id,
        fullname: `${user.firstname} ${user.lastname}`,
        email: user.email,
        status: {
          value: user.isActive,
          label: user.isActive ? "Active" : "Inactive",
        },
        role: {
          value: user.role?.id,
          label: user.role?.name,
        },
        store: {
          value: user.storeLocId,
          label: locationData?.organizations?.lookup?.locations.map((ele) => {
            if (ele.id === user.storeLocId) return ele.address;
          }),
        },
      }));
      setUsersDetails(formattedData);
    }
  }, [usersData, locationData]);

  const columnDefs: ColDef[] = [
    {
      field: "fullname",
      headerName: "Full Name",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      maxWidth: 200,
    },
    {
      field: "email",
      headerName: "Email",
      maxWidth: 250,
      editable: false,
    },
    {
      field: "status",
      headerName: "Status",
      maxWidth: 160,
      editable: false,

      cellRenderer: TableDropdown,
      cellRendererParams: {
        placeholder: "Status",
        options: StatusOptions,
        variant: "unstyled",
        loading: deleteUserResponse.loading,
        updateBackend: (id) => {
          if (userPermissions.fullAccess || userPermissions.edit) {
            deleteUser({
              variables: { id: id, updatedBy: user!.value?.uid },
              onCompleted: (resp) => {
                alert("User status updated successfully.");
                loadUser();
              },
            });
          }
          else {
            Swal.fire({icon: "error", title: "Not Allowed", text: "You are not allowed to make changes to this page"});
          }
        },
      },
      comparator: statusComparator,
    },
    {
      field: "role",
      headerName: "Role",
      maxWidth: 160,
      editable: false,
      cellRenderer: TableDropdown,
      cellRendererParams: {
        placeholder: "Roles",
        options: roleOptions,
        variant: "unstyled",
        updateBackend: (id, selectedOption) => {
          if (userPermissions.fullAccess || userPermissions.edit) {
            updateUserRole({
              variables: {
                setBy: user!.value?.uid,
                userId: id,
                roleId: selectedOption.value,
              },
              onCompleted: (resp) => {
                alert("User role updated successfully.");
                loadUser();
              },
            });
          }
          else {
            Swal.fire({icon: "error", title: "Not Allowed", text: "You are not allowed to make changes to this page"});
          }
        },
      },
      comparator: roleComparator,
    },
    {
      field: "store",
      headerName: "Store",
      maxWidth: 500,
      editable: false,
      cellRenderer: TableDropdown,
      cellRendererParams: {
        controlWidth: 480,
        placeholder: "Locations",
        options: locationData?.organizations?.lookup?.locations.map((ele) => ({
          label: ele.address,
          value: ele.id,
        })),
        loading: locationLoading,
        variant: "unstyled",
        updateBackend: (id, selectedOption) => {
          if (userPermissions.fullAccess || userPermissions.edit) {
            const userDetailsWithMatchingID = usersData.users.get.find(
              (user) => user.id === id
            );
  
            if (userDetailsWithMatchingID) {
              updateUser({
                variables: {
                  updatedBy: user.value?.uid,
                  user: {
                    id: userDetailsWithMatchingID.id,
                    email: userDetailsWithMatchingID.email,
                    isAdmin:
                      userDetailsWithMatchingID.grantLevel !== null &&
                      userDetailsWithMatchingID.grantLevel.grantLvl !== null &&
                      userDetailsWithMatchingID.grantLevel.grantLvl === 50
                        ? true
                        : false,
                    firstname: userDetailsWithMatchingID.firstname,
                    lastname: userDetailsWithMatchingID.lastname,
                    storeLocId: selectedOption.value,
                  },
                },
                onCompleted: (res) => {
                  alert("User store location updated successfully.");
                  loadUser();
                },
              });
            } 
          }
          else {
            Swal.fire({icon: "error", title: "Not Allowed", text: "You are not allowed to make changes to this page"});
          }
        },
      },
      comparator: roleComparator,
    },
  ];

  const onGridReady = (params) => {
    //for onGridReady
    if (params) {
      //for default sorting of row data based on active status and then by fullname (alphabetically),
      //active users are sorted alphabetically by fullname to the top of grid and inactive ones alphabetically by fullname at bottom
      let defaultSortModel: ColumnState[] = [
        { colId: "status", sort: "asc", sortIndex: 0 },
        { colId: "fullname", sort: "asc", sortIndex: 1 },
      ];
      params.columnApi.applyColumnState({ state: defaultSortModel });
      //window.gridApi, used later to access rendered grid at any instance and apply filters on it
      window.gridApi = params.api;
      //when window.gridApi has all the data of params.api the windowApiReady state will become true and will trigger the render of pagination component
      setWindowApiReady(true);
    }
  };

  const isExternalFilterPresent = useCallback((): boolean => {
    //return true if appliedFilter.role or appliedFilter.status has a value i.e. any or both of the filters are applied
    //true means an external filter is present
    return externalFilterPresent(appliedFilter);
  }, []);

  const doesExternalFilterPass = useCallback(
    (node): boolean => {
      if (node.data) {
        return externalFilter(node, appliedFilter);
      }
      return true;
    },
    [appliedFilter.role?.value, appliedFilter.status?.value]
  );

  //This overlay will be shown after filters/search if no results for that filter/search are found.
  //function to get Custom overlay component
  const noResultsFoundOverlay = useMemo(() => {
    return CustomOverlay;
  }, []);
  //function for custom overlay message that you want to display
  const noResultsFoundOverlayParams = useMemo(() => {
    return {
      MessageFunc: () => "No results found.",
    };
  }, []);
  //function to show/hide custom overlay triggered onModelUpdated (ag grid prop)
  const getDisplayedRowCount = () => {
    //counts number of rows currently displayed
    const count = gridRef.current.api.getDisplayedRowCount();
    //shows overlay if row count is zero, hides overlay if it is not zero
    count === 0
      ? gridRef.current.api.showNoRowsOverlay()
      : gridRef.current.api.hideOverlay();
  };

  //this function is called after a search filter OR any other filter is applied to extract filtered data for updated pagination
  const paginationOnFilterChanged = () => {
    //getting new row data after filter is applied
    const filteredData: any = [];
    gridRef.current?.api?.forEachNodeAfterFilter((node: any) => {
      filteredData.push(node.data);
    });
    //setting the filtered data in a state and passing the state as prop to pagination component
    setFilteredUsers(filteredData);
  };

  //this useEffect handles pagination on a rerender of this component
  useEffect(() => {
    //setWindowApiReady is a boolean trigger that renders pagination component when the gird is ready,
    //on a rerender of this component the trigger is set to false to avoid immature render of the pagination component,
    //then it is set to true later when the grid is ready i.e. onGridReady function
    setWindowApiReady(false);
  }, []);

  return (
    <Box>
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
              User Management
            </Text>
            {usersData?.users?.getByOrg?.length ? (
              <AddUser roleOptions={roleOptions} />
            ) : (
              <></>
            )}
          </HStack>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <Tabs colorScheme='black'>
            <TabList>
              <Tab
                onClick={() => {
                  setRolesTab(false);
                }}
              >
                Users
              </Tab>
              <Tab
                onClick={() => {
                  setRolesTab(true);
                }}
              >
                Roles
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel width='100%'>
                <Card variant='outline' style={mainCardStyle}>
                  <CardBody padding='16px'>
                    <VStack spacing='16px' alignItems='flex-start'>
                      <HStack spacing='24px'>
                        <Search
                          gridRef={gridRef}
                          getDisplayedRowCount={getDisplayedRowCount}
                          paginationOnFilterChanged={paginationOnFilterChanged}
                        />

                        <Filter
                          type='status'
                          options={StatusOptions}
                          placeholder={"Status"}
                          paginationOnFilterChanged={paginationOnFilterChanged}
                          window={window}
                        />
                        <Filter
                          type='role'
                          options={roleOptions}
                          placeholder={"Roles"}
                          paginationOnFilterChanged={paginationOnFilterChanged}
                          window={window}
                        />
                      </HStack>
                      <VStack spacing='20px' mt='20px' width='100%'>
                        {usersLoading ? (
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
                        ) : usersData?.users?.getByOrg?.length ? (
                          <>
                            <Box style={containerStyle()}>
                              <Box
                                style={gridStyle()}
                                className='ag-theme-material ag-grid-container'
                              >
                                <AgGridReact
                                  animateRows={true}
                                  editType={"fullRow"}
                                  rowData={usersDetails}
                                  columnDefs={columnDefs}
                                  defaultColDef={defaultColDef()}
                                  onGridReady={onGridReady}
                                  isExternalFilterPresent={
                                    isExternalFilterPresent
                                  }
                                  doesExternalFilterPass={
                                    doesExternalFilterPass
                                  }
                                  pagination={true}
                                  suppressPaginationPanel={true}
                                  paginationPageSize={10}
                                  ref={gridRef}
                                  onModelUpdated={getDisplayedRowCount}
                                  noRowsOverlayComponent={noResultsFoundOverlay}
                                  noRowsOverlayComponentParams={
                                    noResultsFoundOverlayParams
                                  }
                                  multiSortKey={"ctrl"}
                                ></AgGridReact>
                              </Box>
                            </Box>
                          </>
                        ) : (
                          <Center
                            minH='235px'
                            flexDirection='column'
                            borderRadius='4px'
                            border={"1px dashed #8A8A8A"}
                            width='100%'
                          >
                            <FaUsers size={"40px"} />
                            <Text fontSize='h6' fontWeight='semibold'>
                              Add Users to your Organization
                            </Text>
                            <Box paddingTop='16px'>
                              <Button mr={4} size='sm' variant='outline'>
                                Import
                              </Button>
                              <AddUser roleOptions={roleOptions} />
                            </Box>
                          </Center>
                        )}
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              <TabPanel backgroundColor='#F7F5F0'>
                {rolesLoading ? (
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
                ) : roles.length > 0 ? (
                  <RolesManagement
                    roles={roles}
                    setRoles={setRoles}
                    roleOptions={roleOptions}
                    setRoleOptions={setRoleOptions}
                  />
                ) : (
                  <Center
                    minH='235px'
                    flexDirection='column'
                    borderRadius='4px'
                    border={"1px dashed #8A8A8A"}
                    width='100%'
                  >
                    <FaUsers size={"40px"} />
                    <Text fontSize='h6' fontWeight='semibold'>
                      Add Roles to your Organization
                    </Text>
                    <Box paddingTop='16px'>
                      <RolesManagement
                        roles={roles}
                        setRoles={setRoles}
                        roleOptions={roleOptions}
                        setRoleOptions={setRoleOptions}
                      />
                    </Box>
                  </Center>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>
        {windowApiReady && !rolesTab && (
          <GridItem padding={"10px"} area={"footer"}>
            <Center>
              <AgGridPagination
                gridRef={gridRef}
                rowData={usersDetails}
                filteredData={filteredUsers}
              />
            </Center>
          </GridItem>
        )}
      </Grid>
    </Box>
  );
}

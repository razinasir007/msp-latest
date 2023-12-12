import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@apollo/client";
import {
  GetAllClients,
  GetClientsByOrgId,
} from "../../../apollo/clientQueries";
import {
  Box,
  Grid,
  Text,
  GridItem,
  Button,
  Card,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  CardBody,
  Flex,
  HStack,
  VStack,
  SkeletonCircle,
  SkeletonText,
  Center,
} from "@chakra-ui/react";

import { ClientDetails } from "../../components/interfaces";
import { AgGridPagination } from "../../components/shared/agGridPagination";
import { CustomOverlay } from "../../components/shared/customOverlay";
import { AddContact } from "../../components/contacts/addContact";
import Search from "../../components/shared/searchFilter";
import { gridStyle, containerStyle } from "../../../constants/gridStyles";
import { useNavigate } from "react-router-dom";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import moment from "moment";
import { UserPermissions } from "../../routes/permissionGuard";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import { ROUTE_PATHS } from "../../../constants";
import Swal from "sweetalert2";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export default function Contacts() {
  const { userPermissions } = useContext(UserPermissions);
  // const {
  //   loading: clientLoading,
  //   error: clientError,
  //   data: ClientDetails,
  //   refetch: GetAllClientsRefetch,
  // } = useQuery(GetAllClients);

  const [clientDetailsState, setClientDetails] = useState<ClientDetails[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ClientDetails[]>([]);
  const gridRef = useRef();
  const navigate = useNavigate();
  const cancelRef = React.useRef();
  const cancelRef2 = React.useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [openDialog, setOpen] = useState(false);
  const stateUser = useHookstate(globalState.user);
  //for pagination
  const [windowApiReady, setWindowApiReady] = useState<Boolean>(false);
  const {
    loading: clientLoading,
    error: clientError,
    data: ClientDetails,
    refetch: GetAllClientsRefetch,
  } = useQuery(GetClientsByOrgId, {
    variables: { orgId: stateUser!.value!.organization?.id },
  });
  useEffect(() => {
    if (ClientDetails) {
      const formattedData = ClientDetails.clients.getClientsByOrg.map(
        (ele) => ({
          id: ele.id,
          fullname: ele.fullname,
          phoneNumber: ele.phoneNumber,
          email: ele.email,
          createdAt: moment(ele.createdAt).format("MMMM Do YYYY"),
          lastContactedAt: moment(ele.lastContactedAt).format("MMMM Do YYYY"),
        })
      );
      setClientDetails(formattedData);
    }
  }, [ClientDetails]);

  const columnDefs: ColDef[] = [
    {
      field: "fullname",
      headerName: "Full Name",
      maxWidth: 350,
      sort: "asc",
      sortable: true,
      cellRendererFramework: (params: { data: { fullname: any } }) => (
        <div
          onClick={() =>
            {
              if (userPermissions.fullAccess|| userPermissions.view || userPermissions.create || userPermissions.edit) {
                navigate(`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.CLIENT_VIEW}`, {
                  state: params.data,
                })
              }
              else {
                Swal.fire({icon: "error", title: "Not Allowed", text: "You are not allowed to view this order"});
              }
            }
          }
        >
          <Text color='#4480E5' cursor='pointer'>
            {params.data.fullname}
          </Text>
        </div>
      ),
      filter: true,
    },
    {
      field: "email",
      headerName: "Email",
      maxWidth: 350,
      unSortIcon: true,
    },

    {
      field: "phoneNumber",
      headerName: "Phone Number",
      maxWidth: 350,
      editable: false,
      unSortIcon: true,
    },
    {
      field: "createdAt",
      headerName: "Date Added",
      maxWidth: 350,
      editable: false,
      unSortIcon: true,
    },
    {
      field: "lastContactedAt",
      headerName: "Last Contact",
      maxWidth: 350,
      editable: false,
      unSortIcon: true,
    },
  ];

  const handleExportClick = useCallback(() => {
    var params = {
      skipHeader: false,
      skipFooters: true,
      allColumns: true,
      onlySelected: false,
      suppressQuotes: true,
      fileName: "ClientDetails.csv",
      columnSeparator: ",",
    };
    gridRef.current.api.exportDataAsCsv(params);
  }, []);

  const onGridReady = (params) => {
    if (params) {
      //when window.gridApi has all the data of params.api the windowApiReady state will become true and will trigger the render of pagination component
      setWindowApiReady(true);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result;
      const rows = fileContent.split("\n");
      const headers = rows[0].split(",");
      const data = rows.slice(1).map((row) => {
        const values = row.split(",");
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index].trim();
          return obj;
        }, {});
      });
      const formattedData = data.map((el) => ({
        fullname: el?.["Full Name"],
        phoneNumber: el?.["Phone Number"],
        email: el?.["Email"],
        createdAt: el?.["Date Added"],
        lastContactedAt: el?.["Last Contact"],
      }));
      setClientDetails(formattedData);
    };
    reader.readAsText(file);
  };

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

  //this function is called after a search filter is applied to extract filtered data for updated pagination
  const paginationOnFilterChanged = () => {
    //getting new row data after filter is applied
    const filteredData: any = [];
    gridRef.current.api.forEachNodeAfterFilter((node: any) => {
      filteredData.push(node.data);
    });
    //setting the filtered data in a state and passing the state as prop to pagination component
    setFilteredContacts(filteredData);
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
            <Text fontSize='40px' fontWeight='600' lineHeight='35px'>
              Contacts
            </Text>
          </HStack>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <Card variant='outline' style={mainCardStyle}>
            <CardBody padding='16px'>
              <Flex justifyContent='space-between'>
                <HStack spacing='8px'>
                  <Search
                    gridRef={gridRef}
                    getDisplayedRowCount={getDisplayedRowCount}
                    paginationOnFilterChanged={paginationOnFilterChanged}
                  />
                </HStack>
                <HStack>
                  <Button
                    size='sm'
                    variant='outline'
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.create || userPermissions.edit ? false : true
                    }
                    onClick={() => setOpen(true)}
                  >
                    Import Contacts
                  </Button>
                  <Button
                    size='sm'
                    isDisabled={
                      (userPermissions.fullAccess || userPermissions.create || userPermissions.edit) &&
                      ClientDetails
                        ? false
                        : true
                    }
                    variant='outline'
                    onClick={onOpen}
                  >
                    Export Contacts
                  </Button>
                  <AddContact GetAllClientsRefetch={GetAllClientsRefetch} />
                </HStack>
              </Flex>
              <VStack spacing='20px' mt='20px' width='100%'>
                {clientLoading ? (
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
                ) : (
                  <>
                    <Box style={containerStyle()}>
                      <Box
                        style={gridStyle()}
                        className='ag-theme-material ag-grid-container'
                      >
                        <AgGridReact
                          rowData={clientDetailsState}
                          columnDefs={columnDefs}
                          pagination={true}
                          paginationPageSize={10}
                          defaultColDef={{ flex: 1 }}
                          ref={gridRef}
                          cacheQuickFilter={true}
                          suppressPaginationPanel={true}
                          onGridReady={onGridReady}
                          suppressExcelExport={true}
                          onModelUpdated={getDisplayedRowCount}
                          noRowsOverlayComponent={noResultsFoundOverlay}
                          noRowsOverlayComponentParams={
                            noResultsFoundOverlayParams
                          }
                        ></AgGridReact>
                      </Box>
                    </Box>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        {windowApiReady && (
          <GridItem padding={"10px"} area={"footer"}>
            <Center>
              <AgGridPagination
                gridRef={gridRef}
                rowData={clientDetailsState}
                filteredData={filteredContacts}
              />
            </Center>
          </GridItem>
        )}
      </Grid>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Export to csv
            </AlertDialogHeader>

            <AlertDialogBody>
              Client details has been exported successfully, click download
              button to download the csv file
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                variant='outline'
                ref={cancelRef}
                onClick={onClose}
                size='sm'
              >
                Cancel
              </Button>
              <Button ml={3} onClick={handleExportClick} size='sm'>
                Download
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={openDialog}
        leastDestructiveRef={cancelRef2}
        onClose={() => setOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Select a CSV file
            </AlertDialogHeader>

            <AlertDialogBody>
              <Box mt='20px'>
                <input type='file' onChange={handleFileChange} />
              </Box>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                variant='outline'
                onClick={() => setOpen(false)}
                size='sm'
              >
                Done
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

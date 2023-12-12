import React, { useContext, useMemo, useRef } from "react";
import SalesChart from "../../pages/sales/salesChart";
import {
  Box,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  HStack,
  Text,
  CardHeader,
  SimpleGrid,
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { AiFillEye } from "react-icons/ai";
// import { Search } from "react-router-dom";
import {
  containerStyle,
  gridStyle,
  defaultColDef,
} from "../../../constants/gridStyles";
import ProfitChart from "../../pages/sales/profitChart";
import Search from "../shared/searchFilter";
import { ColumnState } from "ag-grid-community";
import { UserPermissions } from "../../routes/permissionGuard";
import { rowData } from "../../../constants";

const mainCardStyle = {
  padding: "0",
  borderRadius: "4px",
  borderColor: "greys.300",
};
const appointmentsCardStyle = {
  padding: "0",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export default function DashboardView() {
  const { userPermissions } = useContext(UserPermissions);
  // const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const gridRef = useRef();
  const onGridReady = (params) => {
    //for onGridReady
    if (params) {
      //for default sorting of row data based on active status and then by fullname (alphabetically),
      //active users are sorted alphabetically by fullname to the top of grid and inactive ones alphabetically by fullname at bottom
      let defaultSortModel: ColumnState[] = [
        { colId: "skuNumber", sort: "asc", sortIndex: 0 },
      ];
      params.columnApi.applyColumnState({ state: defaultSortModel });
      //window.gridApi, used later to access rendered grid at any instance and apply filters on it
      window.gridApi = params.api;
      //when window.gridApi has all the data of params.api the windowApiReady state will become true and will trigger the render of pagination component
      // setWindowApiReady(true);
    }
  };
  const columnDefs = [
    {
      field: "name",
      headerName: "Name",
      maxWidth: 250,
      editable: false,
      sortable: true,
      // filter: true,
    },
    {
      field: "time",
      headerName: "Time",
      maxWidth: 250,
      editable: false,
      sortable: true,
      // filter: true,
    },
    {
      field: "number",
      headerName: "Number",
      maxWidth: 250,
      editable: false,
      sortable: true,
      // filter: true,
    },
  ];

  // specify the data

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
          <Text fontSize='h3' fontWeight='semibold' lineHeight='35px'>
            Dashbaord
          </Text>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <Flex>
            <Card style={mainCardStyle} w='70%'>
              <CardHeader>
                <HStack spacing={3}>
                  <Text fontSize='h5' fontWeight='semibold'>
                    Data
                  </Text>
                  <AiFillEye size={24} />
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={2} spacing='20px'>
                  <SalesChart />
                  <ProfitChart />
                  <SalesChart />
                  <ProfitChart />
                </SimpleGrid>
              </CardBody>
            </Card>
            <Card style={appointmentsCardStyle} w='30%' ml='15px' h='100%'>
              <CardHeader>
                <Text fontWeight='semibold' fontSize='h5'>
                  Schedule
                </Text>
              </CardHeader>
              <CardBody>
                <Box marginBottom={"8px"}>
                  <Search
                    gridRef={gridRef}
                    // getDisplayedRowCount={getDisplayedRowCount}
                    // paginationOnFilterChanged={paginationOnFilterChanged}
                  />
                </Box>
                <Box
                  style={containerStyle()}
                  className='sidebar-container-class'
                >
                  <Box
                    style={gridStyle()}
                    className='ag-theme-material ag-grid-container'
                  >
                    <AgGridReact
                      animateRows={true}
                      editType={"fullRow"}
                      rowData={rowData}
                      columnDefs={columnDefs}
                      defaultColDef={defaultColDef()}
                      onGridReady={onGridReady}
                      ref={gridRef}
                    />
                  </Box>
                </Box>
              </CardBody>
            </Card>
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
}

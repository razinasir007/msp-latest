import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Grid,
  GridItem,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import ProductSold from "./productSold";
import ProfitChart from "./profitChart";
import ReferralSource from "./referralSource";
import SalesChart from "./salesChart";
// import { appliedFilter } from "../../../constants";
import Search from "../../components/shared/searchFilter";
import { ColumnState } from "ag-grid-community";
import { useQuery } from "@apollo/client";
import { GetOrdersByOrganizationIdNew } from "../../../apollo/orderQueries";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import { SelectDropdown } from "../../components/shared/selectDropdown";
import { CustomOverlay } from "../../components/shared/customOverlay";
import { defaultColDef } from "../../../constants/gridStyles";
import Charts from "../../components/charts";
import dummyData from "../../../assets/MockData.json";
const statusList = [
  { value: "", label: "All" },
  { value: "Completed", label: "Completed" },
  { value: "Flagged", label: "Flagged" },
  { value: "Open", label: "Open" },
  { value: "In Progress", label: "In Progress" },
];

export default function Sales() {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [windowApiReady, setWindowApiReady] = useState<Boolean>(false);
  //for pagination
  const user = useHookstate(globalState.user);
  const [rowData, setRowData] = useState<any[]>([]);
  const gridRef = useRef();
  const containerStyle = useMemo(
    () => ({ width: "100%", height: "500px" }),
    []
  );
  const mainCardStyle = {
    padding: "0",
    width: "100%",
    borderRadius: "4px",
    borderColor: "greys.300",
  };

  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  //getting orders on the basis of Orgnizarion ID
  const {
    loading: orgOrdersLoading,
    error: orgOrdersError,
    data: orgOrdersData,
  } = useQuery(GetOrdersByOrganizationIdNew, {
    variables: { orgId: user!.value!.organization?.id },
  });
  const columnDefs = [
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      field: "id",
      headerName: "SKU Number",
      maxWidth: 200,
      filter: true,
    },
    {
      field: "clientFullname",
      headerName: "Customer Name",
      maxWidth: 250,
      unSortIcon: true,
      filter: true,
    },
    {
      field: "createdAt",
      headerName: "Date Of Sale",
      maxWidth: 250,
      editable: false,
      unSortIcon: true,
      cellRenderer: (params: { data: { createdAt: any } }) => (
        <Text cursor='pointer'>{formattedDate(params.data.createdAt)}</Text>
      ),
    },
    {
      field: "noOfProducts",
      headerName: "Items",
      maxWidth: 250,
      editable: false,
      unSortIcon: true,
      sortable: true,
    },
    {
      field: "price",
      headerName: "Amount",
      maxWidth: 250,
      editable: false,
      unSortIcon: true,
    },
    {
      field: "stage",
      headerName: "Status",
      maxWidth: 250,
      editable: false,
      sortable: true,
      filter: true,
    },
  ];
  const formattedDate = (date) => {
    let tempDate = new Date(date);
    const finalDate = tempDate.toLocaleDateString("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return finalDate;
  };

  //some important functionalities i.e. sorting the row data, setting up pagination etc. performed when the grid is ready
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
  const handleFilterChange = (event) => {
    gridRef.current.api.setQuickFilter(event.value);
    if (getDisplayedRowCount) {
      getDisplayedRowCount();
    }
    if (paginationOnFilterChanged) {
      paginationOnFilterChanged();
    }
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
          <Text fontSize='h3' fontWeight='semibold' lineHeight='35px'>
            Sales Tracking
          </Text>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <SimpleGrid columns={2} spacing='20px'>
            <SalesChart />
            <ProfitChart />
            <ProductSold />
            <Charts
              title='Refferal Source'
              dummyData={dummyData}
              type={"bar"}
            />
          </SimpleGrid>
        </GridItem>
        <GridItem marginTop={5}>
          <Card variant='outline' style={mainCardStyle}>
            <CardBody padding='16px'>
              <VStack spacing='16px' alignItems='flex-start'>
                <HStack spacing='24px'>
                  <Search gridRef={gridRef} />
                  <SelectDropdown
                    options={statusList}
                    placeholder=' Status'
                    containerHeight='33px'
                    containerWidth='200px'
                    defaultValue={statusList[0]}
                    onChange={(e) => handleFilterChange(e)}
                  />
                </HStack>
                <VStack spacing='20px' mt='20px' width='100%'>
                  <Box style={containerStyle}>
                    <Box style={gridStyle} className='ag-theme-material'>
                      <AgGridReact
                        animateRows={true}
                        editType={"fullRow"}
                        rowData={orgOrdersData?.orders?.lookupByOrganizationNew}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef()}
                        onGridReady={onGridReady}
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
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}

import React, { useEffect, useMemo, useState, useRef, useContext } from "react";

import {
  Box,
  Center,
  Text,
  Card,
  CardBody,
  HStack,
  VStack,
} from "@chakra-ui/react";

import { AgGridPagination } from "../../components/shared/agGridPagination";
import { ColDef, ColumnState } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
// import { StatusOptions, appliedFilter } from "../../../../constants";
import { CustomOverlay } from "../../components/shared/customOverlay";
import Search from "../../components/shared/searchFilter";

import {
  gridStyle,
  containerStyle,
  defaultColDef,
} from "../../../constants/gridStyles";
//   import {
//     externalFilter,
//     externalFilterPresent,
//     Filter,
//   } from "../../../components/shared/externalFilter";
import { useNavigate } from "react-router-dom";
import { SelectDropdown } from "../../components/shared/selectDropdown";
import { ROUTE_PATHS } from "../../../constants";
import { UserPermissions } from "../../routes/permissionGuard";
import Swal from "sweetalert2";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

const statusList = [
  { value: "", label: "All" },
  { value: "Completed", label: "Completed" },
  { value: "Flagged", label: "Flagged" },
  { value: "Open", label: "Open" },
  { value: "In Progress", label: "In Progress" },
];

export function ProductionGridView(props) {
  const { userPermissions } = useContext(UserPermissions);
  // SETTING AND GETTING ORDERS USING GLOBAL STATE
  // const [rowData, setRowData] = useState<Order[]>([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  //for pagination
  const [windowApiReady, setWindowApiReady] = useState<Boolean>(false);
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();

  const handleViewOrder = (order) => {
    navigate(`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.CLIENT_VIEW_ORDER}`, {
      state: {
        clientId: "1",
        order: { createdAt: "April 14th 2023", id: "1", numberOfProducts: 15 },
      },
    });
  };

  // const handleShow = () => {
  //   // console.log("props.orders.get()[0].dueDate", props.orders.get()[0].dueDate);
  //   return (
  //     props.orders.get()[0].dueDate === undefined ||
  //     !("dueDate" in props.orders.get()[0]) ||  props.orders.get()[0].dueDate === null
  //   );
  // };
  const formattedDate = (date) => {
    let tempDate = new Date(date);
    const finalDate = tempDate.toLocaleDateString("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return finalDate;
  };

  const columnDefs: ColDef[] = [
    {
      field: "name",
      headerName: "Name",
      maxWidth: 200,
      cellRenderer: (params: { data: { name: any } }) => (
        <Box
          onClick={() => {
            if (userPermissions.fullAccess || userPermissions.create || userPermissions.edit) {
              handleViewOrder(params.data);
            } else  Swal.fire({icon: "error", title: "Not Allowed", text: "You are not allowed to view this order"});
          }}
        >
          <Text cursor='pointer'>{params.data.client.fullname}</Text>
        </Box>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      maxWidth: 250,
      editable: false,
    },
    {
      field: "stage",
      headerName: "Stage",
      maxWidth: 160,
      editable: false,
    },
    {
      field: "numberOfProducts",
      headerName: "Items",
      maxWidth: 250,
      editable: false,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      maxWidth: 250,
      editable: false,
      cellRenderer: (params: { data: { createdAt: any } }) => (
        <Text cursor='pointer'>{formattedDate(params.data.createdAt)}</Text>
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      maxWidth: 250,
      editable: false,
      cellRenderer: (params: { data: { dueDate: any } }) => (
        <Text cursor='pointer'>
          {params.data.dueDate ? (
            formattedDate(params.data.dueDate)
          ) : (
            <>No Due Date</>
          )}
        </Text>
      ),
    },
  ];

  const onGridReady = (params) => {
    //for onGridReady
    if (params) {
      //for default sorting of row data based on active status and then by fullname (alphabetically),
      //active users are sorted alphabetically by fullname to the top of grid and inactive ones alphabetically by fullname at bottom
      // let defaultSortModel: ColumnState[] = [
      //   { colId: "dueDate", sort: "asc", sortIndex: 0 },
      // ];
      // params.columnApi.applyColumnState({ state: defaultSortModel });
      //window.gridApi, used later to access rendered grid at any instance and apply filters on it
      window.gridApi = params.api;
      //when window.gridApi has all the data of params.api the windowApiReady state will become true and will trigger the render of pagination component
      setWindowApiReady(true);
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
      <Card variant='outline' style={mainCardStyle}>
        <CardBody padding='16px'>
          <VStack spacing='16px' alignItems='flex-start'>
            <HStack spacing='24px'>
              <Search
                gridRef={gridRef}
                getDisplayedRowCount={getDisplayedRowCount}
                paginationOnFilterChanged={paginationOnFilterChanged}
              />
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
              <Box style={containerStyle()}>
                <Box
                  style={gridStyle()}
                  className='ag-theme-material ag-grid-container'
                >
                  <AgGridReact
                    animateRows={true}
                    editType={"fullRow"}
                    rowData={props.orders.get()}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef()}
                    onGridReady={onGridReady}
                    pagination={true}
                    suppressPaginationPanel={true}
                    paginationPageSize={10}
                    ref={gridRef}
                    onModelUpdated={getDisplayedRowCount}
                    noRowsOverlayComponent={noResultsFoundOverlay}
                    noRowsOverlayComponentParams={noResultsFoundOverlayParams}
                    multiSortKey={"ctrl"}
                  ></AgGridReact>
                </Box>
              </Box>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
      {windowApiReady && (
        <Box marginTop='16px'>
          <Center padding='10px'>
            <AgGridPagination
              gridRef={gridRef}
              rowData={props.orders.get()}
              filteredData={filteredUsers}
            />
          </Center>
        </Box>
      )}
    </Box>
  );
}

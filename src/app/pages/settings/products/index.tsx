import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Box,
  Text,
  Divider,
  VStack,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Button,
  Flex,
  Grid,
  GridItem,
  Center,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";

import { BsShop } from "react-icons/bs";
import { AddProduct } from "../../../components/settings/products/addProduct";
import { useMutation, useQuery } from "@apollo/client";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  OrgUsers,
  ProductDetails,
  ProductOptions,
} from "../../../components/interfaces";
import { v4 as uuidv4 } from "uuid";
import { State, useHookstate } from "@hookstate/core";
import {
  CreateProduct,
  DeleteProduct,
  GetProductDetailByOrgID,
  UpdateProduct,
} from "../../../../apollo/productQueries";
import { ColDef, ColumnState } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "../../../styles/gridCustomStyles.css";
import { StatusOptions, appliedFilter } from "../../../../constants";
import { TableDeleteButton } from "../../../components/shared/tableDeleteButton";
import Search from "../../../components/shared/searchFilter";
import { CustomOverlay } from "../../../components/shared/customOverlay";
import { AgGridPagination } from "../../../components/shared/agGridPagination";
import { statusComparator } from "../../../../helperFunctions";
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
import { globalState } from "../../../../state/store";
import { UserPermissions } from "../../../routes/permissionGuard";
import Swal from "sweetalert2";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export default function Products() {
  const user = useHookstate(globalState.user);
  const { userPermissions } = useContext(UserPermissions);

  const gridRef = useRef<AgGridReact>(null);

  const [addProduct, setAddProduct] = useState<boolean>(false);
  const [productsOverview, setProductsOverview] = useState<
    Array<ProductDetails>
  >([]);
  //for pagination
  const [windowApiReady, setWindowApiReady] = useState(false);
  //for filters
  const [filteredUsers, setFilteredUsers] = useState<OrgUsers[]>([]);

  const product: State<ProductDetails> = useHookstate({} as ProductDetails);

  const {
    loading: productsLoading,
    error: productsError,
    data: productsData,
    refetch: loadProducts,
  } = useQuery(GetProductDetailByOrgID, {
    variables: { orgId: user!.value?.organization?.id },
  });

  const [
    createProduct,
    {
      loading: createProductLoading,
      error: createProductError,
      data: createProductData,
    },
  ] = useMutation(CreateProduct, {});

  const [
    updateProduct,
    {
      loading: updateProductLoading,
      error: updateProductError,
      data: updateProductData,
    },
  ] = useMutation(UpdateProduct, {});

  const [
    deleteProduct,
    {
      loading: deleteProductLoading,
      error: deleteProductError,
      data: deleteProductData,
    },
  ] = useMutation(DeleteProduct, {});

  // format the result returned from the query and set local state
  useEffect(() => {
    if (productsData) {
      const formattedData =
        productsData.productDetails.lookupProductDetailsByOrganization.map(
          (product) => ({
            id: product.id,
            title: product.title,
            description: product.description,
            variants: product.numberOfOptions,
            status: {
              value: product.isActive,
              label: product.isActive ? "Active" : "Inactive",
            },
            flatPrice: product.flatPrice,
            flatCost: product.flatCost,
          })
        );
      setProductsOverview(formattedData);
    }
  }, [productsData]);

  const columnDefs: ColDef[] = [
    {
      field: "title",
      headerName: "Product",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      maxWidth: 300,
    },
    {
      field: "description",
      headerName: "Description",
      maxWidth: 350,
    },
    {
      field: "variants",
      headerName: "Variants",
      maxWidth: 150,
    },
    {
      field: "status.label",
      headerName: "Status",
      maxWidth: 150,
      comparator: statusComparator,
    },
    {
      sortable: false,
      field: "delete",
      headerName: " ",
      maxWidth: 65,
      pinned: "right",
      lockPosition: "right",
      cellRenderer: TableDeleteButton,
      cellRendererParams: {
        onDelete: (id) => {
          if (userPermissions.fullAccess || userPermissions.delete) {
            deleteProduct({
              variables: { id: id },
              onCompleted: (resp) => {
                alert("Product deleted successfully.");
                loadProducts();
              },
            });
          } else
            Swal.fire({
              icon: "error",
              title: "Not Allowed",
              text: "You are not allowed to make changes to this page",
            });
        },
      },
    },
  ];

  const onSelectionChanged = useCallback(() => {
    if (userPermissions.fullAccess || userPermissions.edit) {
      setWindowApiReady(false);
      const selectedNodes = gridRef.current!.api.getSelectedNodes();

      if (selectedNodes.length === 1 && gridRef.current!.api.getFocusedCell()) {
        const selectedNode = selectedNodes[0];
        const colId = gridRef.current!.api.getFocusedCell()!.column.getId();

        if (colId === "delete") {
          // perform only delete functionality
          if (typeof selectedNode.data.onDelete === "function") {
            selectedNode.data.onDelete(selectedNode.data.id);
          }
        } else {
          // perform other functionality
          product.set(selectedNode.data);
          setAddProduct(!addProduct);
        }
      } else if (
        selectedNodes.length === 1 &&
        gridRef.current!.api.getFocusedCell() === undefined
      ) {
        // perform other functionality
        product.set(selectedNodes[0].data);
        setAddProduct(!addProduct);
      } else {
        // do nothing
        <></>;
      }
    }
  }, []);

  const createUpdateProductDetails = () => {
    if (product.id.value) {
      updateProduct({
        variables: {
          updatedBy: user!.value?.uid,
          productDetail: {
            id: product.id.value,
            orgId: user!.value?.organization?.id,
            title: product.title.value,
            description: product.description.value,
            isActive: product.status.value?.value,
            flatPrice: Number(product.flatPrice.value),
            flatCost: Number(product.flatCost.value),
            options: product.options.value?.map((option) => {
              let type =
                option.name === "Frame"
                  ? "FRAME"
                  : option.name === "Matting"
                  ? "MATTING"
                  : option.name === "Size"
                  ? "SIZE"
                  : "OTHER";
              return {
                id: option.id,
                productDetailId: product.id.value,
                name: option.name,
                sortingIndex: option.sortingIndex,
                fields: Object.values(option.fields).map((field) => ({
                  id: field.id,
                  productDetailOptionId: option.id,
                  value: field.value,
                  price: Number(field.price),
                  cost: Number(field.cost),
                  sortingIndex: field.sortingIndex,
                  type: type,
                  image: field.image ? field.image.file : null,
                  colorCode: field.colorCode,
                  imageExtension: "png",
                })),
              };
            }),
          },
        },
        onCompleted: (resp) => {
          alert("Updated");
          loadProducts();
          setAddProduct(!addProduct);
        },
      });
    } else {
      let prodID = uuidv4();
      createProduct({
        variables: {
          createdBy: user!.value?.uid,
          productDetail: {
            id: prodID,
            orgId: user!.value?.organization?.id,
            title: product.title.value,
            description: product.description.value,
            isActive: product.status.value?.value,
            flatPrice: Number(product.flatPrice.value),
            flatCost: Number(product.flatCost.value),

            options: product.options.value?.map((option) => {
              let type =
                option.name === "Frame"
                  ? "FRAME"
                  : option.name === "Matting"
                  ? "MATTING"
                  : option.name === "Size"
                  ? "SIZE"
                  : "OTHER";

              return {
                id: option.id,
                productDetailId: prodID,
                name: option.name,
                sortingIndex: option.sortingIndex,
                fields: Object.values(option.fields).map((field) => ({
                  id: field.id,
                  productDetailOptionId: option.id,
                  value: field.value,
                  price: Number(field.price),
                  cost: Number(field.cost),
                  sortingIndex: field.sortingIndex,
                  type: type,
                  image: field.image ? field.image.file : null,
                  colorCode: field.colorCode,
                  imageExtension: "png",
                })),
              };
            }),
          },
        },
        onCompleted: (resp) => {
          alert("Completed");
          loadProducts();
          product.set({});
          setAddProduct(!addProduct);
        },
      });
    }
  };

  //////////////////////////////////////////////////////////////

  //this useEffect handles pagination on a rerender of this component
  useEffect(() => {
    //setWindowApiReady is a boolean trigger that renders pagination component when the gird is ready,
    //on a rerender of this component the trigger is set to false to avoid immature render of the pagination component,
    //then it is set to true later when the grid is ready i.e. onGridReady function
    setWindowApiReady(false);
  }, []);

  //some important functionalities i.e. sorting the row data, setting up pagination etc. performed when the grid is ready
  const onGridReady = (params) => {
    //for onGridReady
    if (params) {
      //for default sorting of row data based on active status and then by fullname (alphabetically),
      //active users are sorted alphabetically by fullname to the top of grid and inactive ones alphabetically by fullname at bottom
      let defaultSortModel: ColumnState[] = [
        { colId: "status.label", sort: "asc", sortIndex: 0 },
        { colId: "title", sort: "asc", sortIndex: 1 },
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
    [appliedFilter.status?.value, appliedFilter.role?.value]
  );

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
  // function to show/hide custom overlay triggered onModelUpdated (ag grid prop)
  const getDisplayedRowCount = () => {
    //counts number of rows currently displayed
    const count = gridRef.current.api.getDisplayedRowCount();
    //shows overlay if row count is zero, hides overlay if it is not zero
    count === 0
      ? gridRef.current.api.showNoRowsOverlay()
      : gridRef.current.api.hideOverlay();
  };

  return (
    <Box height={windowApiReady ? "auto" : "100%"}>
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
              Products
            </Text>
            {productsData?.productDetails?.lookupProductDetailsByOrganization
              ?.length &&
              !addProduct && (
                <Button
                  leftIcon={<AddIcon />}
                  size='sm'
                  onClick={() => {
                    setWindowApiReady(false);
                    product.set({});
                    setAddProduct(!addProduct);
                  }}
                  isDisabled={
                    userPermissions.fullAccess || userPermissions.create
                      ? false
                      : true
                  }
                >
                  Add Products
                </Button>
              )}
          </HStack>
        </GridItem>

        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          {productsLoading ? (
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
          ) : addProduct ? (
            <AddProduct product={product} />
          ) : productsData?.productDetails?.lookupProductDetailsByOrganization
              ?.length ? (
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
                  </HStack>
                  <VStack spacing='20px' mt='20px' width='100%'>
                    <Box style={containerStyle()}>
                      <Box
                        style={gridStyle()}
                        className='ag-theme-material ag-grid-container'
                      >
                        <AgGridReact
                          animateRows={true}
                          // editType={"fullRow"}
                          rowData={productsOverview}
                          columnDefs={columnDefs}
                          defaultColDef={defaultColDef()}
                          rowHeight={75}
                          rowSelection={"single"}
                          onSelectionChanged={onSelectionChanged}
                          onGridReady={onGridReady}
                          isExternalFilterPresent={isExternalFilterPresent}
                          doesExternalFilterPass={doesExternalFilterPass}
                          pagination={true}
                          suppressPaginationPanel={true}
                          paginationPageSize={10}
                          ref={gridRef}
                          onModelUpdated={getDisplayedRowCount}
                          noRowsOverlayComponent={noResultsFoundOverlay}
                          noRowsOverlayComponentParams={
                            noResultsFoundOverlayParams
                          }
                        ></AgGridReact>
                      </Box>
                    </Box>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <Center
              minH='235px'
              flexDirection='column'
              borderRadius='4px'
              border={"1px dashed #8A8A8A"}
            >
              <BsShop size={"40px"} />
              <Text fontSize='h5' fontWeight='semibold'>
                Set up your products
              </Text>
              <Text fontSize='p4' fontWeight='normal'>
                Before you open up your store, you need products
              </Text>
              <Box paddingTop='16px'>
                <Button
                  leftIcon={<AddIcon />}
                  size='sm'
                  onClick={() => {
                    setAddProduct(!addProduct);
                  }}
                  isDisabled={
                    userPermissions.fullAccess || userPermissions.create
                      ? false
                      : true
                  }
                >
                  Add Products
                </Button>
              </Box>
            </Center>
          )}
        </GridItem>

        {addProduct && (
          <GridItem padding={"16px 24px"} area={"footer"} bg='greys.200'>
            <Flex justifyContent='end'>
              <Button
                mr={4}
                size='sm'
                variant='outline'
                onClick={() => {
                  setAddProduct(!addProduct);
                }}
              >
                Cancel
              </Button>
              <Button
                size='sm'
                variant='solid'
                onClick={() => {
                  // TRY CALLING A FUNCTION HERE THAT CAN CHECK IF THERE ARE RES AND REG OPTIONS AND THEN COMBINE AND RETURN FOR OPTIONS HERE
                  createUpdateProductDetails();
                }}
                isLoading={createProductLoading || updateProductLoading}
                loadingText='Saving...'
                spinnerPlacement='start'
              >
                {product.id.value ? "Update" : "Save"}
              </Button>
            </Flex>
          </GridItem>
        )}
        {windowApiReady && (
          <GridItem padding='8px' area={"footer"}>
            <Center>
              <AgGridPagination
                gridRef={gridRef}
                rowData={productsOverview}
                filteredData={filteredUsers}
              />
            </Center>
          </GridItem>
        )}
      </Grid>
    </Box>
  );
}

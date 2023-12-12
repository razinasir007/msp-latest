import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Spacer,
  Text,
  VStack,
  Link,
} from "@chakra-ui/react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { UpdateOrderStage } from "../../../apollo/orderQueries";
import { globalState } from "../../../state/store";
import { useHookstate } from "@hookstate/core";
import moment from "moment";
import { OrderStageEnum } from "../../../apollo/gql-types/graphql";
import { UserPermissions } from "../../routes/permissionGuard";
import { ROUTE_PATHS } from "../../../constants";

interface data {
  name: string;
  stage: string;
  items: string;
  price: string;
  dueDate?: string;
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  data: data[];
}

interface Columns {
  open: Column;
  inProgress: Column;
  flagged: Column;
  completed: Column;
}

//column initialization
const cards: {
  columns: Columns;
} = {
  columns: {
    open: {
      id: "column-1",
      title: "Open",
      data: [],
    },
    inProgress: {
      id: "column-2",
      title: "In Progress",
      data: [],
    },
    flagged: {
      id: "column-3",
      title: "Flagged",
      data: [],
    },
    completed: {
      id: "column-4",
      title: "Completed",
      data: [],
    },
  },
};

export default function ProductionKanBanView(props) {
  const { userPermissions } = useContext(UserPermissions);

  const { orders } = props;
  // NAVIGATE TO ORDER CLIENTVIEW
  const navigate = useNavigate();
  // LOCAL STATE TO MANAGE ORDERS DATA COMING FROM THE LOCAL HOOKSTATE IN PROPS
  const [data, setData] = useState(cards);
  //getting the user who updates the stage
  const user = useHookstate(globalState.user);

  //update stage mutation
  const [
    UpdateStage,
    {
      loading: updateTermsLoading,
      error: updateTermsError,
      data: updateTermsData,
    },
  ] = useMutation(UpdateOrderStage, {});

  //map data from backend in columns based on their stage, this also gets called when the orders are updated
  useEffect(() => {
    if (props.orders.get()) {
      const updatedData: {
        columns: Columns;
      } = {
        columns: {
          open: {
            ...data.columns.open,
            data: [],
          },
          inProgress: {
            ...data.columns.inProgress,
            data: [],
          },
          flagged: {
            ...data.columns.flagged,
            data: [],
          },
          completed: {
            ...data.columns.completed,
            data: [],
          },
        },
      };
      // push data in columns based on their stage
      props.orders.get().forEach((object) => {
        const obj = { ...object };
        switch (obj.stage) {
          case OrderStageEnum.Completed:
            updatedData.columns.completed.data.push(obj);
            break;
          case OrderStageEnum.Open:
            updatedData.columns.open.data.push(obj);
            break;
          case OrderStageEnum.Inprogress:
            updatedData.columns.inProgress.data.push(obj);
            break;
          case OrderStageEnum.Flagged:
            updatedData.columns.flagged.data.push(obj);
            break;
        }
      });
      setData(updatedData);
    }
  }, [orders.get()]);

  //drag and drop functionality
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result; //getting the source and destination
    // let updatedOrder; //making an updatedOrder variable with local scope to set local hookstate
    if (!destination) return; //if there is no destination, return
    // getting columns
    const columns = { ...data.columns };
    // start column name
    const startColumnName = Object.keys(columns).find(
      (column) => columns[column].id === source.droppableId
    );
    //end column name
    const endColumnName = Object.keys(columns).find(
      (column) => columns[column].id === destination.droppableId
    );
    // start and end column names should exist
    if (startColumnName && endColumnName) {
      const startColumn = columns[startColumnName];
      const endColumn = columns[endColumnName];
      // if start column and end column is same
      if (startColumn === endColumn) {
        const newCards = [...startColumn.data];
        const [removedCard] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, removedCard);
        startColumn.data = newCards;
        //if start and end columns are different
      } else {
        const startCards = [...startColumn.data];
        const endCards = [...endColumn.data];
        // getting the dragged card
        const [draggedCard] = startCards.splice(source.index, 1);
        // updating the dragged card's stage
        draggedCard.stage = endColumn.title.toUpperCase().replace(/\s/g, "");
        //setting the dragged card into destination
        endCards.splice(destination.index, 0, draggedCard);
        // updating the start and end columns
        startColumn.data = startCards;
        endColumn.data = endCards;
        //backend call to update the stage of the dragged card
        UpdateStage({
          variables: {
            id: draggedCard.id,
            updatedBy: user.value?.uid,
            stage: draggedCard.stage,
          },
        });
        //setting the local structured data useState
        setData({
          columns: { ...columns },
        });
        //setting the local unstructred hookstate coming from props
        orders.set((prevState) => {
          prevState.forEach((order) => {
            if (order.id === draggedCard.id) {
              order.stage = draggedCard.stage;
              return order;
            } else return order;
          });
          if (props.sortByDueDate === "dueDate") {
            return sortByDueDate(prevState);
          } else if (props.sortByDueDate === "createdAt") {
            return sortByCreatedAtDate(prevState);
          }
          // return prevState;
        });
      }
    }
  };

  // sort by due date
  const sortByDueDate = (data) => {
    // for the orders that have due date
    const newArrayForDueDate = [];
    // for the orders that do not have due date
    const newArrayForCreatedDate = [];
    // push data from the data array
    data.map((item: any) => {
      if (item.dueDate === null) {
        newArrayForCreatedDate.push(item);
      } else {
        newArrayForDueDate.push(item);
      }
    });
    // sort by due date
    const sortedDataOfDueDate = newArrayForDueDate.sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
    );
    // sort by created at
    const sortedDataOfCreatedAt = newArrayForCreatedDate.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    // final sorted array will have orders sorted acc to due date and for those that do not have due date will be sorted on the basis of createdAt date.
    const finalSortedArray = sortedDataOfDueDate.concat(sortedDataOfCreatedAt);
    return finalSortedArray;
  };

  //sort by created at date
  const sortByCreatedAtDate = (data) => {
    const sortedData = data.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    return sortedData;
  };

  //navigate to the client view order page
  const handleViewOrder = (order) => {
    navigate(`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.CLIENT_VIEW_ORDER}`, {
      state: {
        clientId: order.client.id,
        order: order.id,
      },
    });
  };

  //sorting data based on the sorting selection (due date or created at date)
  useEffect(() => {
    props.orders.set((previousState) => {
      const orders = previousState.map((order) => order);
      if (props.sortByDueDate === "dueDate") {
        const sortedData = sortByDueDate(orders);
        return sortedData;
      } else if (props.sortByDueDate === "createdAt") {
        const sortedData = sortByCreatedAtDate(orders);
        return sortedData;
      }
    });
  }, [props.sortByDueDate]);

  //formatting the dates
  const formattedDate = (date) => {
    let tempDate = new Date(date);
    const finalDate = tempDate.toLocaleDateString("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return finalDate;
  };

  return (
    <Box height='100%'>
      <Flex width='100%' justifyContent='flex-end'></Flex>
      <HStack height='100%' marginTop='16px'>
        <DragDropContext
          onDragEnd={(result) => {
            if (userPermissions.fullAccess || userPermissions.create || userPermissions.edit) {
              onDragEnd(result);
            }
          }}
        >
          {Object.values(data.columns).map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <Card
                  bg='#FCFCFA'
                  key={column.id}
                  style={{
                    width: "25%",
                    height: "100%",
                    border: "1px solid #ccc",
                    padding: "1px",
                  }}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <CardHeader alignContent='center' mt={0}>
                    <Flex justifyContent='space-between'>
                      <Text fontSize='h6' alignSelf='center'>
                        {column.title}
                      </Text>
                      <Text fontSize='h6'>{column.data.length}</Text>
                    </Flex>
                  </CardHeader>
                  <CardBody mt={-4}>
                    <VStack height='100%' spacing='12px'>
                      {column.data.map((object, index) => (
                        <Draggable
                          key={object.id}
                          draggableId={object.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              width='100%'
                              border='1px solid #ccc'
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                boxShadow: snapshot.isDragging
                                  ? "0 0 .4rem #666"
                                  : "none",
                                background: snapshot.isDragging
                                  ? "rgba(255, 255, 255, 0.85)"
                                  : "#FFFFFF",
                                borderRadius: snapshot.isDragging
                                  ? "4px"
                                  : "none",
                              }}
                            >
                              <CardBody>
                                <VStack alignItems='left'>
                                  <Flex>
                                    <Text as='b' fontSize='h7'>
                                      {object?.client?.fullname}
                                    </Text>
                                    <Spacer />
                                    <Link
                                      onClick={() => handleViewOrder(object)}
                                    >
                                      View Order
                                    </Link>
                                  </Flex>
                                  <Text fontSize='h7'>
                                    Items: {object.numberOfProducts}
                                  </Text>
                                  <Text fontSize='h7'>${object.price}</Text>
                                  <HStack>
                                    <Text fontSize='h7'>
                                      Due Date :{" "}
                                      {object.dueDate === null || undefined
                                        ? "-"
                                        : moment(object.dueDate).format(
                                            "MMMM Do YYYY"
                                          )}
                                    </Text>
                                    {/* {object.dueDate ? (
                                      formattedDate(object.dueDate)
                                    ) : (
                                      <Text
                                        fontSize='h7'
                                        color='greys.500'
                                        ml={2}
                                      >
                                        No Due Date
                                      </Text>
                                    )} */}
                                  </HStack>
                                  <Text fontSize='h7'>
                                    Created At:{" "}
                                    {formattedDate(object.createdAt)}
                                  </Text>
                                </VStack>
                              </CardBody>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </HStack>
    </Box>
  );
}

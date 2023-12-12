import { useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Card,
  CardBody,
  Flex,
  VStack,
  Text,
  SimpleGrid,
  SkeletonText,
  Divider,
  HStack,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { GetTodoListByOrderId } from "../../../../../apollo/orderQueries";
import { TbPointFilled } from "react-icons/tb";
import { TiTick } from "react-icons/ti";
import { v4 as uuidv4 } from "uuid";
import { AiTwotoneDelete } from "react-icons/ai";
import { TodoList } from "../../../../../state/interfaces";
import {
  CreateOrUpdateProductTodoList,
  DeleteProductTodo,
} from "../../../../../apollo/productQueries";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../../state/store";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};
export const TodoListForClient = (props: { orderId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [todoDetails, setTodoDetails] = useState<TodoList[]>([]);
  const [productId, setProductId] = useState("");
  const stateUser = useHookstate(globalState.user);
  const [todo, setTodo] = useState("");

  const [
    UpdateProductTodo,
    {
      loading: UpdateTodoLoading,
      error: UpdateTodoError,
      data: UpdateTodoData,
    },
  ] = useMutation(CreateOrUpdateProductTodoList, {});

  const [
    DeleteTodo,
    {
      loading: DeleteTodoLoading,
      error: DeleteTodoError,
      data: DeleteTodoData,
    },
  ] = useMutation(DeleteProductTodo, {});

  const {
    loading: todoLoading,
    error: todoError,
    data: todoData,
    refetch: RefetchTodos,
  } = useQuery(GetTodoListByOrderId, {
    variables: { orderId: props.orderId },
  });
  const handleEditClick = (list) => {
    console.log("list", list);
    // Extract the todos array from the list object and remove __typename
    const todosArray = list.todos.map((todo) => {
      const { __typename, ...todoWithoutTypename } = todo;
      return todoWithoutTypename;
    });

    setTodoDetails(todosArray);
    setProductId(list.id);
    onOpen();
  };

  const addTask = () => {
    if (todo.trim() !== "") {
      const newTodo = {
        id: uuidv4(), // Generate a unique ID
        name: todo,
        sortingIndex: todoDetails.length,
        isCompleted: true,
      };
      setTodoDetails((prevTodoDetails) => [...prevTodoDetails, newTodo]);
      setTodo("");
    }
  };
  const removeTask = (taskId) => {
    const updatedTodoDetails = todoDetails.filter((todo) => todo.id !== taskId);
    setTodoDetails(updatedTodoDetails); // Remove the todo from the state
  };
  const handleDoneClick = () => {
    UpdateProductTodo({
      variables: {
        createdBy: stateUser!.value!.uid,
        productId: productId,
        todos: todoDetails,
        update: true,
      },
      onCompleted: () => {
        onClose();
        RefetchTodos();
      },
    });
  };

  const handleDeleteTodo = (productId) => {
    setProductId(productId);
    DeleteTodo({
      variables: {
        productId: productId,
      },
      onCompleted: () => {
        RefetchTodos();
      },
    });
  };
  return (
    <>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        size='lg'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Todo List:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <HStack w='100%'>
                <Input
                  placeholder='Name'
                  value={todo}
                  onChange={(e) => setTodo(e.target.value)}
                />
                <TiTick
                  size={30}
                  style={{ cursor: "pointer" }}
                  onClick={addTask}
                />
              </HStack>
              <VStack align='start' w='100%' mt='20px'>
                {todoDetails && todoDetails.length > 0 ? (
                  todoDetails.map((todo, index) => (
                    <Box key={todo.id} w='100%'>
                      <Flex justifyContent='space-between'>
                        <HStack>
                          <TbPointFilled size={20} />
                          <Text fontSize='p4'> {todo.name}</Text>
                        </HStack>
                        <AiTwotoneDelete
                          size={22}
                          style={{ cursor: "pointer" }}
                          onClick={() => removeTask(todo.id)}
                        />
                      </Flex>
                    </Box>
                  ))
                ) : (
                  <Text>No Todo List Available</Text>
                )}
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button size='sm' variant='outline' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              size='sm'
              onClick={handleDoneClick}
              isLoading={UpdateTodoLoading}
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Card variant='outline' style={mainCardStyle}>
        <CardBody padding='16px'>
          <VStack>
            <Flex w='100%'>
              <Text fontSize='h5' fontWeight='semibold'>
                Todo List For Products
              </Text>
            </Flex>
            {todoLoading ? (
              <Box
                padding='6'
                width='100%'
                minH='335px'
                maxH='335px'
                mt='20px'
                borderRadius='4px'
              >
                <SkeletonText
                  mt='4'
                  noOfLines={7}
                  spacing='2'
                  skeletonHeight='5'
                />
              </Box>
            ) : (
              <SimpleGrid columns={3} spacing='15px' w='100%' mt='50px'>
                {todoData.orders.lookup.products &&
                  todoData.orders.lookup.products.map((product) => {
                    if (product.todos.length > 0) {
                      return (
                        <Card
                          key={product.id}
                          variant='outline'
                          width='100%'
                          bgColor='#FCFCFA'
                        >
                          <CardBody>
                            <VStack>
                              <Box>
                                <Text fontSize='14px' fontWeight='600'>
                                  Todo List
                                </Text>
                              </Box>
                              <Divider />
                              <Box mt='10px' w='100%'>
                                <VStack spacing={5}>
                                  {product.todos.map((list) => {
                                    return (
                                      <HStack key={list.id} w='100%'>
                                        <TbPointFilled size={20} />
                                        <Text fontSize='p5'>{list.name}</Text>
                                      </HStack>
                                    );
                                  })}
                                </VStack>
                              </Box>
                              <Divider mt='15px' />
                              <HStack spacing={10}>
                                <Button
                                  w='100%'
                                  mt='20px'
                                  variant='outline'
                                  isLoading={
                                    productId === product.id &&
                                    DeleteTodoLoading
                                  }
                                  size='sm'
                                  onClick={() => handleDeleteTodo(product.id)}
                                >
                                  Delete Todo
                                </Button>
                                <Button
                                  w='100%'
                                  mt='20px'
                                  size='sm'
                                  onClick={() => handleEditClick(product)}
                                >
                                  Edit Todo
                                </Button>
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      );
                    }
                    return null; // Don't render the card if there are no todos
                  })}
              </SimpleGrid>
            )}
          </VStack>
        </CardBody>
      </Card>
    </>
  );
};

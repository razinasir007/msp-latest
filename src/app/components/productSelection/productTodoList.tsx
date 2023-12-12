import { CheckCircleIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
  ModalFooter,
  Button,
  VStack,
  Input,
  HStack,
  Flex,
  Box,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BiSolidEdit } from "react-icons/bi";
import { TiTick } from "react-icons/ti";
import { AiTwotoneDelete } from "react-icons/ai";
import { TbPointFilled } from "react-icons/tb";
import { v4 as uuidv4 } from "uuid";
import { TodoList } from "../../../state/interfaces";
import { globalState, useGlobalState } from "../../../state/store";
export const ProductTodoList = (props: {
  selectedProduct;
  handleEditClick;
}) => {
  const wrappedState = useGlobalState();
  const products = wrappedState.getAllProducts();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [todo, setTodo] = useState("");
  const [todoList, setTodoList] = useState<TodoList[]>([]);
  const [todoSelected, setTodoSelected] = useState<any>(null);

  const addTask = () => {
    if (todo.trim() !== "") {
      const newTask = {
        id: uuidv4(), // Generate a unique ID
        name: todo,
        sortingIndex: todoList.length,
        isCompleted: true,
      };
      setTodoList([...todoList, newTask]);
      setTodoList;
      setTodo("");
      globalState.products.set((prev) => {
        return prev.map((product) =>
          product.id === props.selectedProduct.id
            ? { ...product, todoList: [...todoList, newTask] }
            : product
        );
      });
    }
  };

  useEffect(() => {
    if (props.selectedProduct) {
      const selectedProduct = products.find(
        (product) => product.id === props.selectedProduct.id
      );
      setTodoSelected(selectedProduct);
    }
  }, [props.selectedProduct]);

  const removeTask = (taskId) => {
    const updatedTasks = todoList.filter((task) => task.id !== taskId);
    setTodoList(updatedTasks);

    // Update the globalState.products array by mapping over it
    globalState.products.set((prev) => {
      return prev.map((product) => {
        if (product.id === props.selectedProduct.id) {
          // Find the selected product and update its todoList
          return {
            ...product,
            todoList: updatedTasks, // Use the updatedTasks array
          };
        }
        return product;
      });
    });
  };
  return (
    <>
      <BiSolidEdit
        size={19}
        onClick={() => {
          onOpen(), props.handleEditClick();
        }}
        style={{
          cursor: "pointer",
          marginRight: "5px",
        }}
      />
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        size='lg'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Todo List:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={2}>
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
                {todoSelected && todoSelected.todoList ? (
                  todoSelected.todoList.map((todo, index) => (
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
            <Button size='sm' onClick={onClose}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

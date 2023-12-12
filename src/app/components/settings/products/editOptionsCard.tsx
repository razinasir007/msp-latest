import React from "react";
import {
  Table,
  Button,
  Box,
  HStack,
  Square,
  Input,
  TableContainer,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
  Divider,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { MdOutlineDragIndicator } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { ColorPicker } from "../../shared/colorPicker";
import { FrameHandler } from "./frameHandler";

export function EditOptionsCard(props: {
  parentDragHandle?;
  option?;
  optionsState?;
  setEditOptions?;
}) {
  const { optionsState, option, parentDragHandle } = props;

  const addRow = () => {
    const field: {
      id: string;
      sortingIndex: number;
      value: string;
      price: number;
      cost: number;
      image?: string;
      colorCode?: string;
    } = {
      id: uuidv4(),
      sortingIndex: option.fields.length,
      value: "",
      price: 0,
      cost: 0,
    };

    optionsState.set((oriState) => {
      oriState.map((defOps) => {
        if (defOps.id === option.id) {
          if (defOps.name === "Frame") {
            field.image = "";
          } else if (defOps.name === "Matting") {
            field.colorCode = "";
          }
          defOps.fields.push(field);
        }
      });
      return oriState;
    });
  };

  const deleteField = (index) => {
    optionsState.set((oriState) => {
      oriState.map((defOps) => {
        if (defOps.id === option.id) {
          defOps.fields.splice(index, 1);
          defOps.fields.map((field, index) => {
            field.sortingIndex = index;
          });
        }
      });
      return oriState;
    });
  };

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    // Handle the case where the item was moved within the same column
    if (result.type === "DEFAULT") {
      optionsState.set((oriState) => {
        oriState.map((defOps) => {
          if (defOps.id === option.id) {
            const [removed] = defOps.fields.splice(result.source.index, 1);
            defOps.fields.splice(result.destination.index, 0, removed);
            defOps.fields.map((field, index) => {
              field.sortingIndex = index;
            });
          }
        });
        return oriState;
      });
    }
  };

  const handleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    optionsState.set((oriState) => {
      oriState.map((defOps) => {
        if (defOps.id === option.id) {
          defOps.fields[index][name] = value;
        }
      });
      return oriState;
    });
  };

  return (
    <VStack spacing='10px'>
      <Divider width='100%' opacity={1} />
      <Box width='100%'>
        <Text fontSize='p5' paddingLeft='33px'>
          Options Name
        </Text>
        <HStack spacing='8px' alignItems='center' paddingTop='8px'>
          <Square size='25px' {...parentDragHandle}>
            <MdOutlineDragIndicator size='22px' />
          </Square>
          <Input
            size='sm'
            type='text'
            onChange={(event) => {
              const { value } = event.target;
              optionsState.set((oriState) => {
                oriState.map((defOps) => {
                  if (defOps.id === option.id) {
                    defOps.name = value;
                  }
                });
                return oriState;
              });
            }}
            value={option.name}
          />
          <Square size='25px'>
            <FaTrash
              size='18px'
              onClick={() => {
                optionsState.set((oriState) => {
                  return oriState.filter((current) => current.id !== option.id);
                });
              }}
              cursor='pointer'
            />
          </Square>
        </HStack>
      </Box>

      <TableContainer width='100%'>
        <Table variant='unstyled' size='xs'>
          <Thead>
            <Tr>
              <Th></Th>
              {["Frame", "Matting"].includes(option.name) && <Th></Th>}
              <Th fontSize='p5' fontWeight='normal'>
                Options Values
              </Th>
              <Th fontSize='p5' fontWeight='normal'>
                Price
              </Th>
              <Th fontSize='p5' fontWeight='normal'>
                Cost
              </Th>
              <Th></Th>
            </Tr>
          </Thead>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='droppable'>
              {(provided, snapshot) => (
                <Tbody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  // style={getListStyle(
                  //   snapshot.isDraggingOver
                  // )}
                >
                  {option?.fields.length > 0 &&
                    option.fields.map((field, index) => (
                      <Draggable
                        key={index}
                        draggableId={String(index + 22)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            // {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              boxShadow: snapshot.isDragging
                                ? "0 0 .4rem #666"
                                : "none",
                              background: snapshot.isDragging
                                ? "rgba(255, 255, 255, 0.85)"
                                : "none",
                            }}
                          >
                            <Td>
                              <Square size='25px' {...provided.dragHandleProps}>
                                <MdOutlineDragIndicator size='22px' />
                              </Square>
                            </Td>
                            {["Matting"].includes(option.name) && (
                              <Td>
                                <ColorPicker
                                  color={field.colorCode}
                                  handleChange={(newColor) => {
                                    optionsState.set((oriState) => {
                                      oriState.map((defOps) => {
                                        if (defOps.id === option.id) {
                                          defOps.fields[index].colorCode =
                                            newColor;
                                        }
                                      });
                                      return oriState;
                                    });
                                  }}
                                />
                              </Td>
                            )}
                            {["Frame"].includes(option.name) && (
                              <Td>
                                <FrameHandler
                                  imageData={field}
                                  optionsState={optionsState}
                                  option={option}
                                />
                              </Td>
                            )}
                            <Td>
                              <Input
                                isRequired
                                size='sm'
                                type='text'
                                name='value'
                                onChange={(event) => {
                                  handleChange(index, event);
                                }}
                                value={field.value}
                              />
                            </Td>
                            <Td>
                              <Input
                                size='sm'
                                type='number'
                                name='price'
                                onChange={(event) => {
                                  handleChange(index, event);
                                }}
                                value={field.price}
                              />
                            </Td>
                            <Td>
                              <Input
                                size='sm'
                                type='number'
                                name='cost'
                                onChange={(event) => {
                                  handleChange(index, event);
                                }}
                                value={field.cost}
                              />
                            </Td>
                            <Td>
                              <Square size='25px'>
                                <FaTrash
                                  size='18px'
                                  onClick={() => {
                                    deleteField(index);
                                  }}
                                  cursor='pointer'
                                />
                              </Square>
                            </Td>
                          </Tr>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </Tbody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </TableContainer>

      <Flex justifyContent='space-between' width='100%'>
        <Button
          variant='mspCustom'
          onClick={() => {
            addRow();
          }}
          size='sm'
        >
          Add another value
        </Button>
        <Button
          variant='outline'
          onClick={() => {
            const allFieldsPopulated = option.fields.every(
              (field) => field.value !== ""
            );

            if (allFieldsPopulated) {
              props.setEditOptions({ id: null });
            } else {
              alert("OPTION FIELD CANNOT BE EMPTY.");
            }
          }}
          size='sm'
        >
          Done
        </Button>
      </Flex>
    </VStack>
  );
}

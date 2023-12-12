import React, { useContext, useState } from "react";
import {
  Box,
  IconButton,
  Flex,
  Text,
  SimpleGrid,
  Center,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  DeleteCustomerField,
  GetCustomerFields,
} from "../../../../apollo/customerFieldQueries";
import { useMutation } from "@apollo/client";
import { EditableField, EditableTags } from "../../interfaces";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MdOutlineDragIndicator } from "react-icons/md";
import {
  DeleteCustomerTag,
  GetCustomerTags,
} from "../../../../apollo/customerTagQueries";
import { useGlobalState } from "../../../../state/store";
import { UserPermissions } from "../../../routes/permissionGuard";

export function FieldsCard(props: {
  scenario: string;
  setField?: any;
  fields?: Array<EditableField>;
  setFields?: any;
  setTag?: any;
  tags?: Array<EditableTags>;
  setTags?: any;
  onOpen: any;
  setUpdateOrder?: any;
}) {
  const {
    scenario,
    fields,
    tags,
    setTags,
    setTag,
    onOpen,
    setField,
    setFields,
    setUpdateOrder,
  } = props;

  const globalState = useGlobalState();
  const userProfile = globalState.getUserProfile();
  const { userPermissions } = useContext(UserPermissions);

  const [
    deleteCustomerField,
    {
      loading: deleteFieldLoading,
      error: deleteFieldError,
      data: deleteFieldData,
    },
  ] = useMutation(DeleteCustomerField, { refetchQueries: [GetCustomerFields] });

  const [
    deleteCustomerTag,
    { loading: deleteTagLoading, error: deleteTagError, data: deleteTagData },
  ] = useMutation(DeleteCustomerTag, { refetchQueries: [GetCustomerTags] });

  const scenarioMap = {
    fieldsCard: {
      data: fields,
      setToEdit: setField,
      backendCall: async (fieldID) => {
        setDeleteLoading((prev) => ({
          ...prev,
          [fieldID]: true,
        }));
        try {
          await deleteCustomerField({
            variables: { id: fieldID, deletedBy: userProfile?.uid },
            onCompleted: (resp) => {
              alert("Field Deleted Successfully");
            },
          });
        } catch (error) {
          console.log(error);
        }
        setDeleteLoading((prev) => ({
          ...prev,
          [fieldID]: false,
        }));
      },
    },

    tagsCard: {
      data: tags,
      setToEdit: setTag,
      backendCall: async (tagID) => {
        setDeleteLoading((prev) => ({
          ...prev,
          [tagID]: true,
        }));
        try {
          await deleteCustomerTag({
            variables: { id: tagID, deletedBy: userProfile?.uid },
            onCompleted: (resp) => {
              alert("Tag Deleted Successfully");
            },
          });
        } catch (error) {
          console.log(error);
        }
        setDeleteLoading((prev) => ({
          ...prev,
          [tagID]: false,
        }));
      },
    },
  };

  const { data, setToEdit, backendCall } = scenarioMap[scenario];

  const [deleteLoading, setDeleteLoading] = useState({});

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    // Handle the case where the item was moved within range
    if (result.type === "DEFAULT") {
      setFields
        ? setFields((prev) => {
            const [removed] = prev.splice(result.source.index, 1);
            prev.splice(result.destination.index, 0, removed);
            prev.map((option, index) => {
              option.sortingIndex = index;
            });
            return prev;
          })
        : setTags((prev) => {
            const [removed] = prev.splice(result.source.index, 1);
            prev.splice(result.destination.index, 0, removed);
            prev.map((option, index) => {
              option.sortingIndex = index;
            });
            return prev;
          });
      setUpdateOrder(() => {
        return fields
          ? fields
              ?.filter((value) => value.id !== undefined && value.id !== null)
              .map((value) => value.id)
          : tags
              ?.filter((value) => value.id !== undefined && value.id !== null)
              .map((value) => value.id);
      });
    }
  };

  return (
    <Box width='100%'>
      <DragDropContext
        onDragEnd={(result) => {
          if (userPermissions.fullAccess || userPermissions.edit) {
            onDragEnd(result);
          }
        }}
      >
        <Droppable droppableId='droppable'>
          {(provided, snapshot) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              // style={getListStyle(
              //   snapshot.isDraggingOver
              // )}
            >
              {data?.map((value, index) => (
                <Draggable
                  key={index}
                  draggableId={String(index + 22)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <SimpleGrid
                      id={value.id}
                      height='55px'
                      width='100%'
                      columns={5}
                      templateColumns='25px 1fr 1fr 1fr 80px'
                      spacingX='12px'
                      ref={provided.innerRef}
                      {...provided.draggableProps}
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
                      <Center {...provided.dragHandleProps}>
                        <MdOutlineDragIndicator size='22px' />
                      </Center>
                      <Center justifyContent='flex-start'>
                        <Text fontSize='p5'>{value.name}</Text>
                      </Center>
                      <Center justifyContent='flex-start'>
                        <Text fontSize='p5' noOfLines={1}>
                          {value.inputType?.label
                            ? value.inputType.label
                            : value.description === null
                            ? ""
                            : value.description}
                        </Text>
                      </Center>
                      <Center justifyContent='flex-start'>
                        <Text fontSize='p5'>
                          {value.required
                            ? "Required"
                            : value.createdAt
                            ? value.createdAt
                            : "Not Required"}
                        </Text>
                      </Center>
                      <Flex
                        justify='space-between'
                        align='center'
                        marginRight='10px'
                      >
                        <IconButton
                          fontSize='18px'
                          variant='unstyled'
                          aria-label='Edit Field'
                          sx={{
                            ":hover": {
                              backgroundColor: "#EAE8E9",
                            },
                          }}
                          onClick={() => {
                            setToEdit(value);
                            return onOpen();
                          }}
                          icon={<EditIcon />}
                          isDisabled={
                            userPermissions.fullAccess || userPermissions.edit
                              ? false
                              : true
                          }
                        />
                        <IconButton
                          isLoading={deleteLoading[value.id]}
                          fontSize='18px'
                          variant='unstyled'
                          aria-label='Delete Field'
                          sx={{
                            ":hover": {
                              backgroundColor: "#EAE8E9",
                            },
                          }}
                          onClick={() => backendCall(value.id)}
                          icon={<DeleteIcon />}
                          isDisabled={
                            userPermissions.fullAccess || userPermissions.delete
                              ? false
                              : true
                          }
                        />
                      </Flex>
                    </SimpleGrid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}

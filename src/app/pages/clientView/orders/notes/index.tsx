import React, { useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  Button,
  Flex,
  SkeletonCircle,
  SkeletonText,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { ClientViewNotes } from "../../../../components/clientView/notes/notes";
import { useMutation, useQuery } from "@apollo/client";
import {
  CreateNote,
  DeleteNote,
  EditNote,
  GetNote,
} from "../../../../../apollo/orderQueries";
import { useFirebaseAuth } from "../../../../auth";
import Swal from "sweetalert2";
import moment from "moment";

export const Notes = (props: { orderId }) => {
  const { user } = useFirebaseAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editShow, setEditShow] = useState(false);
  const [values, setValues] = useState("");
  const [note, setNote] = useState("");

  const [
    CreateNotes,
    {
      loading: createNoteLoading,
      error: createNoteError,
      data: createNoteData,
    },
  ] = useMutation(CreateNote, {});

  const [
    UpdateNote,
    {
      loading: UpdateNoteLoading,
      error: UpdateNoteError,
      data: UpdateNoteData,
    },
  ] = useMutation(EditNote, {});

  const {
    loading: OrderNoteLoading,
    error: OrderNoteError,
    data: OrderNoteData,
    refetch: refetchNotes,
  } = useQuery(GetNote, {
    variables: { orderId: props.orderId },
  });

  const [
    DeleteNotes,
    {
      loading: deleteNoteLoading,
      error: deleteNoteError,
      data: deleteNoteData,
    },
  ] = useMutation(DeleteNote, {
    refetchQueries: [
      {
        query: GetNote,
        variables: { orderId: props.orderId },
      },
    ],
  });

  const addNotes = () => {
    let noteId = uuidv4();
    CreateNotes({
      variables: {
        createdBy: user?.uid,
        orderNote: {
          orderId: props.orderId,
          note: note,
          id: noteId,
          userId: user?.uid,
        },
      },
    }).then((val) => {
      if (val.data) {
        refetchNotes();
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Note created successfully",
        });
        onClose();
      }
    });
  };

  const editClick = (value) => {
    setValues(value);
    setEditShow(true);
  };
  const handleDelete = (value) => {
    DeleteNotes({
      variables: {
        id: value.id,
      },
    }).then((val) => {
      if (val.data) {
        refetchNotes();

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Note deleted successfully",
        });
      }
    });
  };

  const editNote = () => {
    UpdateNote({
      variables: {
        updatedBy: user?.uid,
        orderNote: {
          orderId: props.orderId,
          note: note,
          id: values.id,
          userId: user?.uid,
        },
      },
    }).then((val) => {
      if (val.data) {
        refetchNotes();
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Note updated successfully",
        });
        setEditShow(false);
      }
    });
  };

  return (
    <>
      <Box>
        <Flex justifyContent='space-between'>
          <Text fontSize='h5' fontWeight='600'>
            Notes:{" "}
            {OrderNoteLoading
              ? "Loading..."
              : OrderNoteData?.orderNotes.lookupByOrder.length}
          </Text>
          <Button variant='outline' leftIcon={<AddIcon />} onClick={onOpen}>
            Add Note
          </Button>
        </Flex>
        <VStack mt='15px' spacing='24px'>
          {OrderNoteLoading || deleteNoteLoading || UpdateNoteLoading ? (
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
              {OrderNoteData?.orderNotes.lookupByOrder.map((ele, index) => {
                return (
                  <React.Fragment key={index}>
                    <ClientViewNotes
                      note={ele}
                      text={ele.note}
                      date={moment(ele.createdAt).format("MMMM Do YYYY")}
                      handleEditClick={() => editClick(ele)}
                      deleteClick={() => handleDelete(ele)}
                    />
                  </React.Fragment>
                );
              })}
            </>
          )}
        </VStack>
      </Box>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        size='lg'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Note:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize='p4' fontWeight='400' mb='8px'>
              Add note
            </Text>
            <Textarea
              h='350px'
              placeholder='Add notes'
              size='lg'
              onChange={(e) => setNote(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button mr={3} isLoading={createNoteLoading} onClick={addNotes}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        blockScrollOnMount={false}
        isOpen={editShow}
        onClose={() => setEditShow(false)}
        size='lg'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Note:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize='p4' fontWeight='400' mb='8px'>
              Edit note
            </Text>
            <Textarea
              h='350px'
              placeholder='Edit notes'
              size='lg'
              defaultValue={values.note}
              onChange={(e) => setNote(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button variant='outline' mr={3} onClick={() => setEditShow(false)}>
              Close
            </Button>
            <Button mr={3} isLoading={UpdateNoteLoading} onClick={editNote}>
              Edit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

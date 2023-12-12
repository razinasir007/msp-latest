import React from "react";
import {
  Text,
  IconButton,
  Flex,
  Spacer,
  Center,
  SimpleGrid,
  Image,
  Spinner,
} from "@chakra-ui/react";
import { TiDelete } from "react-icons/ti";
import { UploadedPhoto } from "../../../state/interfaces";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { FaFolder } from "react-icons/fa";

export default function UploadedCard(props: {
  deleteImage?;
  image?: UploadedPhoto;
  filename?;
  type?;
  size?;
  removeImage?;
  path?;
  label?: string;
  folderClick?;
  thumbnail?: string;
  showButtons?: boolean;
  handleRightClick?(): void;
}) {
  return (
    <SimpleGrid
      onDoubleClick={() => {
        props.folderClick(); // Execute the double-click function
      }}
      onContextMenu={props.handleRightClick}
      cursor={"pointer"}
      // id={value.id}
      height='55px'
      width='100%'
      columns={4}
      templateColumns='25px 1fr 1fr 80px'
      spacingX='12px'
      // ref={provided.innerRef}
      // {...provided.draggableProps}
      style={{
        // ...provided.draggableProps.style,
        // boxShadow: snapshot.isDragging ? "0 0 .4rem #666" : "none",
        // background: snapshot.isDragging
        //   ? "rgba(255, 255, 255, 0.85)"
        //   : "none",
        borderTop: "1px solid lightgray",
      }}
    >
      <Center
      // {...provided.dragHandleProps}
      >
        {props.thumbnail === undefined ? (
          <FaFolder size='25px' color='#6aa9d4' />
        ) : props.thumbnail === "" ? (
          <Spinner />
        ) : (
          <Image src={props.thumbnail} />
        )}
      </Center>

      <Center justifyContent='flex-start'>
        <Text fontSize='p4' fontWeight='500'>
          {props.label}
        </Text>
      </Center>

      <Center justifyContent='flex-start'>
        <Text fontSize='p5' noOfLines={1}>
          {/* {value.inputType?.label
              ? value.inputType.label
              : value.description === null
              ? ""
              : value.description} */}
        </Text>
      </Center>
      {props.showButtons && (
        <Flex justify='space-between' align='center' marginRight='10px'>
          <IconButton
            fontSize='18px'
            variant='unstyled'
            aria-label='Edit Field'
            sx={{
              ":hover": {
                backgroundColor: "#EAE8E9",
              },
            }}
            // onClick={() => {
            //   setToEdit(value);
            //   return onOpen();
            // }}
            icon={<EditIcon />}
          />
          <IconButton
            // isLoading={deleteLoading[value.id]}
            fontSize='18px'
            variant='unstyled'
            aria-label='Delete Field'
            sx={{
              ":hover": {
                backgroundColor: "#EAE8E9",
              },
            }}
            onClick={() => props.deleteImage()}
            icon={<DeleteIcon />}
          />
        </Flex>
      )}
    </SimpleGrid>
  );
}

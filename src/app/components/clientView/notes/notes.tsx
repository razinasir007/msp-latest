import React from "react";
import {
  Box,
  Card,
  CardBody,
  HStack,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { BsThreeDots } from "react-icons/bs";
import { DeleteIcon } from "@chakra-ui/icons";
import { BiEdit } from "react-icons/bi";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";

const mainCardStyle = {
  padding: "0",
  width: "98%",
  borderRadius: "4px",
  borderColor: "greys.300",
  minHeight: "160px",
  backgroundColor: "#FCFCFA",
};

export const ClientViewNotes = (props) => {
  const user = useHookstate(globalState.user);

  return (
    <>
      <Card variant='outline' style={mainCardStyle}>
        <CardBody padding='16px'>
          <Box float='right'>
            <HStack>
              <Text fontSize='p5' fontWeight='600'>
                {props.date}
              </Text>
              {/* <IconButton
                variant='outline'
                aria-label='three-dot'
                icon={<BsThreeDots size={20} />}
                onClick={() => alert("three dots")}
              /> */}
              {user!.value?.uid === props.note.createdBy && (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label='Options'
                    icon={<BsThreeDots size={20} />}
                    variant='outline'
                  />
                  <MenuList>
                    <MenuItem
                      icon={<BiEdit size={20} />}
                      onClick={props.handleEditClick}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem icon={<DeleteIcon />} onClick={props.deleteClick}>
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </HStack>
          </Box>
          <Box w='1075px'>
            <Text fontSize='p4' fontWeight='400'>
              {props.text}
            </Text>
          </Box>
        </CardBody>
      </Card>
    </>
  );
};

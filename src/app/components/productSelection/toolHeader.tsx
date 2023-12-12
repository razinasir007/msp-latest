import React from "react";
import { useGlobalState } from "../../../state/store";
import { State } from "@hookstate/core";

import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
} from "@chakra-ui/react";

import { CalibrateModal } from "./calibrateModal";

import { DeleteIcon } from "@chakra-ui/icons";
import { FaTrash } from "react-icons/fa";
import { IoShareOutline } from "react-icons/io5";
import { MdOutlinePresentToAll } from "react-icons/md";
import { RxDimensions } from "react-icons/rx";
import { useProSidebar } from "react-pro-sidebar";

export function ToolHeader(props: {
  widht: State<number, {}>;
  length: State<number, {}>;
}) {
  const wrappedState = useGlobalState();
  const { collapseSidebar } = useProSidebar();
  return (
    <HStack h='100%'>
      <Menu>
        <MenuButton size='sm' as={Button}>
          <Button size='sm' leftIcon={<RxDimensions />}>
            Target Dimensions
          </Button>
        </MenuButton>
        <MenuList className='profile-list'>
          <MenuItem
            onClick={() => {
              props.widht.set(3);
              props.length.set(5);
            }}
          >
            3 x 5 inches
          </MenuItem>
          <MenuItem
            onClick={() => {
              props.widht.set(5);
              props.length.set(8);
            }}
          >
            5 x 8 inches
          </MenuItem>
          <MenuItem
            onClick={() => {
              props.widht.set(8.5);
              props.length.set(11);
            }}
          >
            8.5 x 11 inches
          </MenuItem>
          <MenuItem
            onClick={() => {
              props.widht.set(11);
              props.length.set(18);
            }}
          >
            11 x 18 inches
          </MenuItem>
        </MenuList>
      </Menu>
      <DeleteIcon
        fontSize='18px'
        onClick={() => {
          wrappedState.removeAllProducts();
        }}
      />
      <Spacer />
      <CalibrateModal />
      <Button
        variant='mspCustom'
        size='sm'
        leftIcon={<IoShareOutline size='1.2em' />}
      >
        Share
      </Button>
      <Button size='sm' leftIcon={<MdOutlinePresentToAll size='1.2em' />}>
        Present
      </Button>
    </HStack>
  );
}

import React from "react";
import { useFirebaseAuth } from "../../auth";
import "./styles.scss";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Flex,
  Portal,
} from "@chakra-ui/react";

import { MdAccountCircle } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { SlDocs } from "react-icons/sl";
import { FaQuestionCircle } from "react-icons/fa";

export function ProfileButton(props) {
  const { signOut } = useFirebaseAuth();
  return (
    <Menu>
      <MenuButton as={Flex}>{props.children}</MenuButton>
      <Portal>
        <MenuList className='profile-list'>
          <MenuGroup title='Profile'>
            <MenuItem icon={<MdAccountCircle />}>My Account</MenuItem>
            <MenuItem icon={<IoLogOut />} onClick={() => signOut()}>
              Logout
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuGroup title='Help'>
            <MenuItem icon={<SlDocs />}>Docs</MenuItem>
            <MenuItem icon={<FaQuestionCircle />}>FAQ</MenuItem>
          </MenuGroup>
        </MenuList>
      </Portal>
    </Menu>
  );
}

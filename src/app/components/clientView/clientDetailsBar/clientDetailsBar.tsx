import React from "react";
import {
  Divider,
  Box,
  VStack,
  Text,
  HStack,
  SkeletonCircle,
  SkeletonText,
  Flex,
} from "@chakra-ui/react";
import { MdAccountCircle } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiLogoutBoxLine } from "react-icons/ri";
import { CLIENT_ROLE } from "../../../../constants";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { useFirebaseAuth } from "../../../auth";
const Frame1 = require("../../../../assets/Message.png");
const Frame2 = require("../../../../assets/calendar.png");
const Frame3 = require("../../../../assets/frame.png");

export const ClientDetailsBar = (props) => {
  const { signOut } = useFirebaseAuth();
  const user = useHookstate(globalState.user);
  return (
    <Box
      width='313px'
      padding='16px'
      height='100%'
      backgroundColor='#FCFCFA'
      position='fixed'
    >
      {props.loading ? (
        <Box
          padding='6'
          boxShadow='lg'
          bg='greys.400'
          width='100%'
          h='600px'
          mt='20px'
          borderRadius='4px'
        >
          <SkeletonCircle
            size='10'
            startColor='greys.200'
            endColor='greys.600'
          />
          <SkeletonText mt='4' noOfLines={10} spacing='4' skeletonHeight='5' />
        </Box>
      ) : (
        <VStack height='100%'>
          <Box w='100%'>
            <HStack>
              <MdAccountCircle size={40} />
              <Box>
                <VStack spacing='0px'>
                  <Text fontSize='p4' fontWeight='400'>
                    {props.name}
                  </Text>
                  <Text fontSize='p5' fontWeight='400'>
                    {props.email}
                  </Text>
                </VStack>
              </Box>

              <BsThreeDotsVertical size={20} style={{ marginLeft: 40 }} />
            </HStack>
          </Box>
          <Box>
            <HStack mt='16px' spacing='24px'>
              {user.get()?.role?.name === CLIENT_ROLE.name ? (
                <Flex alignItems='center'>
                  <RiLogoutBoxLine
                    size={35}
                    style={{ cursor: "pointer" }}
                    onClick={() => signOut()}
                  />
                  <Text fontSize='p4'>Logout</Text>
                </Flex>
              ) : (
                <>
                  <img src={Frame1} alt='img' width='36px' height='36px' />
                  <img src={Frame2} alt='img' width='36px' height='36px' />
                  <img src={Frame3} alt='img' width='36px' height='36px' />
                </>
              )}
            </HStack>
          </Box>
          <Divider />
          <Box w='100%'>
            <Box mt='16px'>
              <Text w='100%' fontSize='p6' color='#8A8884' fontWeight='400'>
                Email
              </Text>
              <Text fontSize='p4' fontWeight='400'>
                {props.email}
              </Text>
            </Box>
            <Box mt='16px'>
              <Text fontSize='p6' color='#8A8884' fontWeight='400'>
                Phone Number
              </Text>
              <Text fontSize='p4' fontWeight='400'>
                {props.phoneNumber}
              </Text>
            </Box>
            <Box mt='16px'>
              <Text fontSize='p6' color='#8A8884' fontWeight='400'>
                Account Created
              </Text>
              <Text fontSize='p4' fontWeight='400'>
                {props.createdAt}
              </Text>
            </Box>
            <Box mt='16px'>
              <Text fontSize='p6' color='#8A8884' fontWeight='400'>
                Last Contacted At
              </Text>
              <Text fontSize='p4' fontWeight='400'>
                {props.lastContactedAt}
              </Text>
            </Box>
            <Box mt='16px'>
              <Text fontSize='p6' color='#8A8884' fontWeight='400'>
                Total Orders
              </Text>
              <Text fontSize='p4' fontWeight='400'>
                {props.totalOrder}
              </Text>
            </Box>
            <Box mt='16px'>
              <Text fontSize='p6' color='#8A8884' fontWeight='400'>
                Location
              </Text>
              <Text fontSize='p4' fontWeight='400'>
                {props.location}
              </Text>
            </Box>
            <Box mt='16px'>
              <Text fontSize='p6' color='#8A8884' fontWeight='400'>
                Appointment Date
              </Text>
              <Text fontSize='p4' fontWeight='400'>
                {props.appointments}
              </Text>
            </Box>
          </Box>
        </VStack>
      )}
    </Box>
  );
};

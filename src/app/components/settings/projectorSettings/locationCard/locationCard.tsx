import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Flex,
  HStack,
  IconButton,
  Text,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AiFillDelete, AiFillStar } from "react-icons/ai";
import { AiOutlineStar } from "react-icons/ai";
import { UserPermissions } from "../../../../routes/permissionGuard";

export const LocationCard1 = (props) => {
  const { userPermissions } = useContext(UserPermissions);
  return (
    <Card
      onClick={props.onCardClick}
      cursor='pointer'
      _hover={{ bg: "gray.100" }}
      w='100%'
      minW='280px'
      bg={props.active ? "gray.100" : "white"}
    >
      <CardHeader>
        <Center>
          {" "}
          <Text fontSize='h6' fontWeight='bold'>
            {props.screenName}
          </Text>
        </Center>
      </CardHeader>
      <CardBody>
        <Flex justifyContent='space-between'>
          <Box>
            <Text>
              <b>Pixels</b>:({props.pixelRaio} pixels/inch)
            </Text>
          </Box>
        </Flex>
        {props.favoriteScreen && (
          <Flex mt='20px' justifyContent='flex-end'>
            <IconButton
              size='xs'
              variant='outline'
              icon={
                props.isFavorite ? (
                  <AiFillStar size={20} />
                ) : (
                  <AiOutlineStar size={20} />
                )
              }
              onClick={(e) => {
                e.stopPropagation();
                props.handleFavorite();
              }}
              aria-label='Favorite'
              isLoading={props.favoriteLoading}
            />
          </Flex>
        )}
      </CardBody>
      {props.deleteCard && (
        <CardFooter>
          {/* <AiFillDelete size={22} onClick={props.deleteCard} /> */}
          <IconButton
            size='xs'
            icon={<AiFillDelete size='16' />}
            onClick={props.deleteCard}
            aria-label='Delete'
            isLoading={props.deleteLoading}
            isDisabled={
              userPermissions.fullAccess || userPermissions.delete
                ? false
                : true
            }
          />
        </CardFooter>
      )}
    </Card>
  );
};

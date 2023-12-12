import React from "react";
import { Card, CardBody, Checkbox, Flex, Text } from "@chakra-ui/react";
import { FaFolder } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

export const ImageCard = (props) => {
  const mainCardStyle = {
    padding: "0",
    width: "250px",
    height: "64px",
    borderRadius: "20px",
    borderColor: "greys.300",
    backgroundColor: props.bg,
    cursor: "pointer",
  };

  return (
    <div onClick={props.folderClick}>
      <Card variant='outline' style={mainCardStyle}>
        <CardBody padding='16px'>
          <Flex justifyContent='space-between' alignItems='center' mt='5px'>
            <FaFolder size={20} />
            <Text fontSize='p5' fontWeight='600' mr='15px'>
              {props.folderName}
            </Text>
            {props.folderSelection ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Checkbox
                  colorScheme='green'
                  defaultChecked={props.checked}
                  bg='#f5f9ff'
                  onChange={props.handleFolderCheck}
                />
              </div>
            ) : (
              <BsThreeDotsVertical size={20} />
            )}
          </Flex>
        </CardBody>
      </Card>
    </div>
  );
};

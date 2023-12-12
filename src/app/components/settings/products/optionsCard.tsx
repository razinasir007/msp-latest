import React from "react";
import {
  Button,
  Box,
  HStack,
  Square,
  Text,
  Divider,
  Tag,
  TagLabel,
  Circle,
} from "@chakra-ui/react";
import { MdOutlineDragIndicator } from "react-icons/md";

export function OptionsCard(props: {
  dragHandle?;
  option?;
  setEditOptions?;
  editOptions?;
  setOptions?;
}) {
  const dragHandle = props.dragHandle;

  return (
    <>
      <Divider width='100%' opacity={1} />
      <Box width='100%' my='10px'>
        <HStack spacing='8px' alignItems='center' width='100%'>
          <Square size='25px' {...dragHandle}>
            <MdOutlineDragIndicator size='22px' />
          </Square>
          <Box width='100%'>
            <Text fontSize='h6' fontWeight='semibold'>
              {props.option.name}
            </Text>
            <HStack spacing='8px' paddingTop='8px'>
              {props.option.fields.map((field, index) => (
                <Tag
                  key={index}
                  size='lg'
                  variant='subtle'
                  borderRadius='full'
                  colorScheme='whiteAlpha'
                  color='black'
                  fontSize='p5'
                  fontWeight='normal'
                  border='1px solid rgba(0, 0, 0, 0.6)'
                >
                  {props.option.name === "Matting" && (
                    <Circle
                      border='1px'
                      borderColor='greys.600'
                      bg={field.colorCode}
                      size='25px'
                      ml={-1}
                      mr={1}
                    />
                  )}
                  <TagLabel>{field.value}</TagLabel>
                </Tag>
              ))}
            </HStack>
          </Box>
          <Button
            mr={4}
            size='sm'
            variant='outline'
            onClick={() => {
              props.setEditOptions({ id: props.option.id });
            }}
          >
            Edit
          </Button>
        </HStack>
      </Box>
    </>
  );
}

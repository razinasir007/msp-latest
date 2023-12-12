import React from "react";
import { HexAlphaColorPicker, HexColorInput } from "react-colorful";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Square,
} from "@chakra-ui/react";

export const ColorPicker = (props: { color; handleChange }) => {
  return (
    <Popover trigger='click'>
      <PopoverTrigger>
        <Square
          size='25px'
          bg={props.color}
          border='1px'
          borderColor='greys.400'
          borderRadius='4px'
        />
      </PopoverTrigger>
      <PopoverContent width='fit-content' border='none' bg='none'>
        <PopoverArrow />
        <HexAlphaColorPicker
          color={props.color}
          onChange={props.handleChange}
        />
        <HexColorInput color={props.color} onChange={props.handleChange} />
      </PopoverContent>
    </Popover>
  );
};

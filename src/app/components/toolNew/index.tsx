import React from "react";
import { Center } from "@chakra-ui/react";
import { HorizontalStepper } from "../stepper";

export default function ToolView(){
  return (
    <Center padding={6} height='100vh' maxW='100%'>
      <HorizontalStepper />
    </Center>
  );
}

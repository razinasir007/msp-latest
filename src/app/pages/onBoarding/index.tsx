import React from "react";
import { Box, Center, Image } from "@chakra-ui/react";
import { OnBoardingStepper } from "../../components/onboarding/onBoardingStepper";

const mainLogo = require("../../../assets/mspMain.png");

export default function OnBoarding(){
  return (
    <Box>
      <Center mt='20px'>
        <Image src={mainLogo} width='105.5px' height='55px' />
      </Center>
      <Center padding={6} height='100%' maxW='100%'>
        <OnBoardingStepper />
      </Center>
    </Box>
  );
}
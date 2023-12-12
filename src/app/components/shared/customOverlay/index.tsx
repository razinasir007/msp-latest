import React from "react";
import { Box, Text } from "@chakra-ui/react";

export function CustomOverlay(props: { MessageFunc: () => string }) {
  return (
    <>
      <Box padding='6'>
        <Text>{props.MessageFunc()}</Text>
      </Box>
    </>
  );
}

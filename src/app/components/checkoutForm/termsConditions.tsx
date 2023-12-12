import { Box } from "@chakra-ui/react";
import React from "react";
import { SelectTermsConditions } from "./selectTermsConditions";
import { Signature } from "./signature";

export function TermsConditions() {
  return (
    <Box>
      <SelectTermsConditions />
      <Signature />
    </Box>
  );
}

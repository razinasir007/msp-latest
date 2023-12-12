import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import { render } from "react-dom";
import App from "./app/App";
import theme from "./app/theme/theme";
import { loadEnv } from "./loadconfig";

loadEnv()

render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>,
  document.getElementById("app")
);
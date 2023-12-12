import React, { useState } from "react";
import { ScreenCalibrations } from "./screenCalibrations";
import { BordersAndBackgrounds } from "./bordersAndBackgrounds";
import { Slideshow } from "./slideshow";
import {
  Box,
  Grid,
  Text,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";

export default function ScreenSettings() {
  return (
    <>
      <Box height="100%">
        <Grid
          templateAreas={`"header"
                  "content"
                  "footer"`}
          gridTemplateRows={"75px 1fr 61px"}
          gridTemplateColumns={"1fr"}
          h="100%"
        >
          <GridItem padding={"24px 24px 16px"} area={"header"}>
            <Text fontSize="h2" fontWeight="semibold" lineHeight="35px">
              Screen/Projector
            </Text>
          </GridItem>
          <GridItem>
            <Tabs colorScheme="gray">
              <TabList paddingLeft="20px">
                <Tab>Screen Calibrations & Options</Tab>
                <Tab>Borders & Backgrounds</Tab>
                <Tab>Slideshow</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <ScreenCalibrations />
                </TabPanel>
                <TabPanel>
                  <BordersAndBackgrounds />
                </TabPanel>
                <TabPanel>
                  <Slideshow />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </GridItem>
        </Grid>
      </Box>
    </>
  );
}

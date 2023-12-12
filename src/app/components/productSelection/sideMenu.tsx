import React, { useState } from "react";
import { ImmutableArray, State } from "@hookstate/core";

import {
  VStack,
  Grid,
  GridItem,
  Box,
  Text,
} from "@chakra-ui/react";
import { SelectedView } from "./selectedView";
import { ProductView } from "./productView";
import { RoomsView } from "./roomsView";
import { IoImageSharp } from "react-icons/io5";
import { MdBedroomParent } from "react-icons/md";
import { FaCartPlus } from "react-icons/fa";
import { UploadedPhoto } from "../../../state/interfaces";

export function SideMenu(props: {
  heightSelectedSideList: any;
  selectedImages: ImmutableArray<UploadedPhoto>;
  selectedImageId: State<string, {}>;
  switchView: State<string, {}>;
  selectedProductId: State<string, {}>;
  roomId: State<string, {}>;
  productsDrawerIsOpen;
}) {
  const [searchItem, setSearchItem] = useState("");
  const [cart, setCart] = useState(false);
  const [images, setImages] = useState(true);
  const [roomView, setRoomView] = useState(false);
  return (
    <Grid
      templateAreas={`"buttons view"`}
      gridTemplateColumns={props.productsDrawerIsOpen ? "55px 1fr" : "55px"}
      h={props.heightSelectedSideList}
    >
      <GridItem area={"buttons"}>
        <VStack color={"#FFFFFF"} padding='16px' spacing='16px'>
          <IoImageSharp
            fontSize='23px'
            cursor={'pointer'}
            onClick={() => {
              setImages(true);
              setCart(false);
              setRoomView(false);
            }}
          />
          <MdBedroomParent
            fontSize='23px'
            cursor={'pointer'}
            onClick={() => {
              setImages(false);
              setCart(false);
              setRoomView(true);
            }}
          />
          <FaCartPlus
            fontSize='23px'
            cursor={'pointer'}
            onClick={() => {
              setImages(false);
              setCart(true);
              setRoomView(false);
            }}
          />
        </VStack>
      </GridItem>
      {props.productsDrawerIsOpen && (
        <GridItem
          area={"view"}
          className='sidebar-container-class'
          maxHeight={props.heightSelectedSideList}
        >
          <VStack
            spacing='10px'
            py='16px'
            px='8px'
            overflowY={"scroll"}
            maxHeight={props.heightSelectedSideList}
          >
            {images ? (
              <Box>
                <Text marginTop={'8px'} fontSize={"h4"} color={"#FFFFFF"}>
                  Images
                </Text>
                <SelectedView
                  selectedImages={props.selectedImages}
                  selectedImageId={props.selectedImageId}
                  // searchItem={searchItem}
                  switchView={props.switchView}
                />
              </Box>
            ) : cart ? (
              <Box>
                <Text marginTop={'8px'} fontSize={"h4"} color={"#FFFFFF"}>
                  Cart
                </Text>
                <ProductView selectedProductId={props.selectedProductId} />
              </Box>
            ) : (
              roomView && (
                <Box>
                  <Text marginTop={'8px'} fontSize={"h4"} color={"#FFFFFF"}>
                    Room View
                  </Text>
                  <RoomsView
                    selectedImages={props.selectedImages}
                    selectedProductId={props.selectedProductId}
                    roomId={props.roomId}
                    switchView={props.switchView}
                  />
                </Box>
              )
            )}
          </VStack>
        </GridItem>
      )}
    </Grid>
  );
}

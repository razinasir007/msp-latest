import React, { useState } from "react";
import { globalState, useGlobalState } from "../../../state/store";
import { State, useHookstate } from "@hookstate/core";
import Cropper from "react-cropper";
import Draggable from "react-draggable";
import { Box, Button, Center, Text, VStack, Flex } from "@chakra-ui/react";
import { ImageContainer } from "./imageContainer";
import { AutoFrame } from "../autoframe";
import { UploadedPhoto } from "../../../state/interfaces";
import "cropperjs/dist/cropper.css";
import { MdOutlinePhotoSizeSelectLarge } from "react-icons/md";

export function MainView(props: {
  heightMainView: any;
  selectedImage: UploadedPhoto;
  selectedImageId: any;
  width: State<number, {}>;
  length: State<number, {}>;
  targetWidth: number;
  targetHeight: number;
  selectedProductId: State<string, {}>;
  roomId: State<string, {}>;
  switchView: State<string, {}>;
  matting: string;
  frameImageUrl: string;
  // imageUrl: string;
  AutoFrameHeight: number;
  AutoFrameWidth: number;
  rotation: number;
  waterMark;
  frameWidth: Number;
  widthView: Boolean;
}) {
  const wrappedState = useGlobalState();
  const state = useHookstate(globalState);
  const products = wrappedState.getAllProducts();
  const roomViewProducts = wrappedState.getRoomViewProducts();
  const roomViewImages = wrappedState.getRoomViewImages();
  const calibrate = useHookstate(false);
  const cropper = useHookstate<any>(undefined);
  const rooms = useHookstate(globalState.roomState.rooms);
  const CustomRoom = useHookstate(globalState.toolCustomRooms);

  const selectedRoom =
    rooms.get().find((room) => room.id == props.roomId.get()) || rooms.get()[0];
  const selectedCustomRoom =
    CustomRoom.get().find(
      (customRoom) => customRoom.id == props.roomId.get()
    ) || CustomRoom.get()[0];

  const ppi = selectedRoom.ppi;
  const anchor = { ...selectedRoom.anchor };

  const selectedProduct =
    products.find((product) => product.id == props.selectedProductId.get()) ||
    products[0];
  // scaled the selected products dimensions
  // const scaledHeight =
  //   selectedProduct?.sizeDetails.height * selectedCustomRoom[0].ppi;
  // const scaledWidth =
  //   selectedProduct?.sizeDetails.width * selectedCustomRoom[0].ppi;
  // This happens when the user hits the "calibrate" to "close" the calibration tool
  function calibrateRoom() {
    calibrate.set((prev) => !prev);
  }

  const setDimensions = () => {
    const instance = cropper.get();
    if (instance) {
      // has the actual dimensions of the cropbox on the image
      const data = instance.getData();

      // holds the dimension of the crop box on the users screen
      const cropBoxData = instance.getCropBoxData();

      // find the ratio from actual to phsical pixels
      const imagepy = pythagorean(data.width, data.height);
      const croppy = pythagorean(cropBoxData.width, cropBoxData.height);
      const scale = croppy / imagepy;

      const paperHypotenuse = 13.9; // inches -> 8.5 x 11 inches
      const ppi = (imagepy / paperHypotenuse) * scale;

      const updated = {
        ...selectedRoom,
        ppi: ppi,
        anchor: {
          x: cropBoxData.left,
          y: cropBoxData.top,
        },
      };
      updateRoom(updated);
    }
  };

  function updateRoom(updated) {
    rooms.set((previous) => {
      return previous.map((room) => {
        if (room.id == updated.id) {
          return updated;
        }
        return room;
      });
    });
  }

  function pythagorean(sideA, sideB) {
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  }

  //returns true if the dimensions are configured
  function isDemensionsSet(): boolean {
    const ppi = selectedRoom.ppi;
    return !isNaN(ppi);
  }

  // function updateAnchorCoordinates(x, y) {
  //   const updated = {
  //     ...selectedRoom,
  //     anchor: {
  //       x: x,
  //       y: y,
  //     },
  //   };
  //   updateRoom(updated);
  // }
  function updateAnchorCoordinates(x, y, productId) {
    state.roomViewImages.set((prev) => {
      return prev.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            anchorPoints: {
              x: x,
              y: y,
            },
          };
        }
        return product;
      });
    });

    // const updated = {
    //   ...selectedRoom,
    //   anchor: {
    //     x: x,
    //     y: y,
    //   },
    // };
    // updateRoom(updated);
  }

  return (
    <Box height='100%' className='hide-scrollbar'>
      <Center height={props.heightMainView} position='relative'>
        {props.selectedImage && props.switchView.get() === "selectedImage" && (
          <AutoFrame
            widthView={props.widthView}
            frameWidth={props.frameWidth}
            productId={props.selectedImageId.get()}
            selectedId={props.selectedImageId.get()}
            rotation={props.rotation}
            matting={props.matting}
            frameImageURL={`data:image/png;base64,${props.frameImageUrl}`}
            imageURL={props.selectedImage.resizedBase64}
            height={props.AutoFrameHeight}
            width={props.AutoFrameWidth}
            waterMark={props.waterMark}
            view={props.switchView.get()}
          />
        )}
        {props.switchView.get() === "room" && (
          <Box width='100%'>
            <Box height={props.heightMainView} bg='white'>
              <ImageContainer
                src={selectedRoom.url}
                imageAttr={{ draggable: false }}
              >
                {/* This draggable area appears on top of the room view */}
                {roomViewImages.map((product) => {
                  const x = product.anchorPoints.x;
                  const y = product.anchorPoints.y;
                  return (
                    <Flex
                      height={0}
                      position='absolute'
                      top={0}
                      left={0}
                      key={product.id}
                    >
                      <Draggable
                        position={{ x, y }}
                        onDrag={(e, data) => {
                          updateAnchorCoordinates(
                            data.lastX,
                            data.lastY,
                            product.id
                          );
                        }}
                      >
                        <Box
                          padding={0}
                          width={100}
                          height={100}
                          cursor={"pointer"}
                          style={{
                            textAlign: "center",
                          }}
                          onClick={() => {
                            props.selectedImageId.set(product.id);
                          }}
                        >
                          <AutoFrame
                            widthView={props.widthView}
                            frameWidth={props.frameWidth}
                            productId={product.id}
                            selectedId={props.selectedImageId.get()}
                            rotation={props.rotation}
                            matting={product.matting}
                            frameImageURL={`data:image/png;base64,${product.frameImage}`}
                            imageURL={product.resizedBase64}
                            height={product.height}
                            width={product.width}
                            waterMark={props.waterMark}
                            view={props.switchView.get()}
                          />
                        </Box>
                      </Draggable>
                    </Flex>
                  );
                })}
              </ImageContainer>
            </Box>

            <VStack position='absolute' top='5px' right='5px'>
              {props.switchView.get() === "room" && (
                <>
                  <Button
                    size='sm'
                    leftIcon={<MdOutlinePhotoSizeSelectLarge size='1.2em' />}
                    onClick={() => calibrateRoom()}
                  >
                    Calibrate Room
                  </Button>

                  <Button
                    size='sm'
                    onClick={() => props.switchView.set("selectedImage")}
                  >
                    Disable Room View
                  </Button>
                </>
              )}
              {!isNaN(ppi) && (
                <Text>{Math.round(ppi * 100) / 100.0}px (pixels/inch)</Text>
              )}
            </VStack>
          </Box>
        )}
        {props.switchView.get() === "customRoom" && (
          <Box width='100%'>
            <Box height={props.heightMainView} bg='white'>
              <ImageContainer
                src={selectedCustomRoom.imageUrl}
                imageAttr={{ draggable: false }}
              >
                {/* This draggable area appears on top of the room view */}
                {roomViewImages.map((product) => {
                  const x = product.anchorPoints.x;
                  const y = product.anchorPoints.y;
                  return (
                    <Flex
                      height={0}
                      position='absolute'
                      top={0}
                      left={0}
                      key={product.id}
                    >
                      <Draggable
                        position={{ x, y }}
                        onDrag={(e, data) => {
                          updateAnchorCoordinates(
                            data.lastX,
                            data.lastY,
                            product.id
                          );
                        }}
                      >
                        <Box
                          padding={0}
                          width={product.width}
                          height={product.height}
                          cursor={"pointer"}
                          style={{
                            textAlign: "center",
                          }}
                          onClick={() => {
                            props.selectedImageId.set(product.id);
                          }}
                        >
                          <AutoFrame
                            widthView={props.widthView}
                            frameWidth={props.frameWidth}
                            productId={product.id}
                            selectedId={props.selectedImageId.get()}
                            rotation={props.rotation}
                            matting={product.matting}
                            frameImageURL={`data:image/png;base64,${product.frameImage}`}
                            imageURL={product.resizedBase64}
                            height={product.height}
                            width={product.width}
                            waterMark={props.waterMark}
                            view={props.switchView.get()}
                          />
                        </Box>
                      </Draggable>
                    </Flex>
                  );
                })}
              </ImageContainer>
            </Box>

            <VStack position='absolute' top='5px' right='5px'>
              {props.switchView.get() === "customRoom" && (
                <Button
                  size='sm'
                  onClick={() => props.switchView.set("selectedImage")}
                >
                  Disable Custom Room View
                </Button>
              )}
              {!isNaN(ppi) && (
                <Text>{Math.round(ppi * 100) / 100.0}px (pixels/inch)</Text>
              )}
            </VStack>
          </Box>
        )}
      </Center>
    </Box>
  );
}

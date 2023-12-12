import React, { useEffect, useRef, useState } from "react";
import { globalState, useGlobalState } from "../../../state/store";
import { useHookstate } from "@hookstate/core";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  HStack,
  Text,
} from "@chakra-ui/react";
import { SideMenu } from "./sideMenu";
import { useNavigate } from "react-router-dom";
import { MainView } from "./mainView";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { DeleteIcon } from "@chakra-ui/icons";
import { RightToolBar } from "./rightToolBar";
import { BsCartPlusFill } from "react-icons/bs";
import { BiRotateRight } from "react-icons/bi";
import { ROUTE_PATHS } from "../../../constants";
export const ProductionSelection = (props: { productsDetails }) => {
  const [heightSelectedSideList, setHeightSelectedSideList] = useState(400);
  const [heightMainView, setHeightMainView] = useState(395);
  const [isOpen, setIsOpen] = useState(false);
  const [productsDrawerIsOpen, setProductsDrawerIsOpen] = useState(true);

  const [totalPrices, setTotalPrices] = useState({});
  const [productReservedOptions, setProductReservedOptions] = useState([]);
  const [productRegularOptions, setProductRegularOptions] = useState([]);
  const state = useHookstate(globalState);
  const [waterMark, setWatermark] = useState(false);
  const [frameWidth, setFrameWidth] = useState(1);
  const [widthView, setWidthView] = useState(false);
  const refSelectedSideList = useRef<any>();
  const refMainView = useRef<any>();
  const wrappedState = useGlobalState();
  // const selectedImages = wrappedState.getSelectedImages();
  const selectedImages = wrappedState.getPresentationImages();
  const localState = useHookstate(globalState);
  const localProductSelection = localState.productSelection;
  const selectedImageId = localProductSelection.imageId;
  const width = localProductSelection.width;
  const length = localProductSelection.length;
  const pixelRatio = localProductSelection.pixelRatio.get();
  const selectedScreen = wrappedState.getSelectedLocationScrenAndSettings();
  const selectedPixel = selectedScreen[0]?.ppi;

  const selectedImage =
    selectedImages.find((image) => image.id == selectedImageId.get()) ||
    selectedImages[0];
  const calibrationCheck = wrappedState.getCalibrationCheck();
  const targetWidth = width.get() * pixelRatio;
  const targetHeight = length.get() * pixelRatio;

  const roomId = useHookstate(localState.roomState.roomId);
  const selectedProductId = useHookstate(localState.roomState.productId);
  const switchView = useHookstate("");
  const pixelPerInches = localState.productSelection.pixelRatio.get();
  const [rotation, setRotation] = useState(0);
  const navigate = useNavigate();

  const [activeProduct, setActiveProduct] = useState({
    title: "",
    description: "",
    id: "",
    flatCost: "",
    flatPrice: "",
  });

  const [options, setOptions] = useState({
    size: {
      value: "",
      price: "",
      cost: "",
      id: "",
    },
    matting: {
      value: "",
      price: "",
      cost: "",
      id: "",
      colorCode: "",
    },
    frame: {
      value: "",
      img: "",
      cost: "",
      id: "",
      price: "",
    },
  });

  useEffect(() => {
    function handleWindowResize() {
      if (refSelectedSideList.current)
        setHeightSelectedSideList(
          refSelectedSideList.current.clientHeight - 155
        );
      if (refMainView.current)
        setHeightMainView(refMainView.current.clientHeight);
    }
    setHeightSelectedSideList(refSelectedSideList.current.clientHeight - 155);
    setHeightMainView(refMainView.current.clientHeight);

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  //SETTING DEFAULT FRAME
  useEffect(() => {
    if (
      props.productsDetails &&
      props.productsDetails[0]?.reservedOptions &&
      props.productsDetails[0]?.reservedOptions.length > 0
    ) {
      const frames = props.productsDetails[0]?.reservedOptions.find(
        (option) => option.name === "Frame"
      );

      if (frames && frames.reservedFields && frames.reservedFields.length > 0) {
        const initialFrame = frames.reservedFields[0].image;
        // setFrameImg(initialFrame);
        setOptions((prevOptions) => ({
          ...prevOptions,
          frame: {
            ...prevOptions.frame,
            img: initialFrame,
          },
        }));
      }
    }
  }, [props.productsDetails]);

  const handleProductClick = (options) => {
    setProductReservedOptions(options.reservedOptions);
    setProductRegularOptions(options.regularOptions);
    // setActiveProduct({
    //   title: options.title,
    //   description: options.description,
    //   id: options.id,
    //   flatPrice: options.flatPrice,
    //   flatCost: options.flatCost,
    // });
    setActiveProduct((prevProduct) => ({
      ...prevProduct,
      title: options.title,
      description: options.description,
      id: options.id,
      flatPrice: options.flatPrice,
      flatCost: options.flatCost,
    }));
  };

  const handleReservedOptionsClick = (option, field) => {
    switch (option.name) {
      case "Size":
        const size = field.value.split("x");
        const Imgwidth = parseInt(size[0]);
        const Imgheight = parseInt(size[1]);
        setOptions((prevOptions) => ({
          ...prevOptions,
          size: {
            value: field.value,
            price: field.price,
            cost: field.cost,
            id: field.id,
          },
        }));
        // setting width and height for the product global state, will change after calibration
        width.set(Imgwidth);
        length.set(Imgheight);
        state.roomViewImages.set((prev) => {
          return prev.map((image) => {
            if (image.id === selectedImageId.get()) {
              return {
                ...image,
                height:
                  Imgheight *
                  (calibrationCheck ? selectedPixel : pixelPerInches),
                width:
                  Imgwidth *
                  (calibrationCheck ? selectedPixel : pixelPerInches),
              };
            }
            return image;
          });
        });
        break;
        case "Frame":
        setWidthView(false);
        setOptions((prevOptions) => ({
          ...prevOptions,
          frame: {
            value: field.value,
            img: field.image,
            cost: field.cost,
            id: field.id,
            price: field.price,
            frameWidth: frameWidth,
          },
        }));
        state.roomViewImages.set((prev) => {
          return prev.map((image) => {
            if (image.id === selectedImageId.get()) {
              return {
                ...image,
                frameImage: field.image,
              };
            }
            return image;
          });
        });
        break;
      case "Matting":
        setOptions((prevOptions) => ({
          ...prevOptions,
          matting: {
            value: field.value,
            price: field.price,
            cost: field.cost,
            id: field.id,
            colorCode: field.colorCode,
          },
        }));
        state.roomViewImages.set((prev) => {
          return prev.map((image) => {
            if (image.id === selectedImageId.get()) {
              return {
                ...image,
                matting: field.colorCode,
              };
            }
            return image;
          });
        });
        break;

      default:
        break;
    }

    // Update the prices in the state object dynamically
    setTotalPrices((prevPrices) => ({
      ...prevPrices,
      [option.name.toLowerCase()]: Number(field.price),
    }));
  };

  const handleRegularOptionsClick = (option, field) => {
    setTotalPrices((prevPrices) => ({
      ...prevPrices,
      [option.name.toLowerCase()]: Number(field.price),
    }));
  };

  const handleAddProduct = () => {
    wrappedState.addProduct(
      selectedImage,
      length.get() * (calibrationCheck ? selectedPixel : pixelPerInches),
      width.get() * (calibrationCheck ? selectedPixel : pixelPerInches),
      options.frame,
      options.matting,
      options.size,
      length.get(),
      width.get(),
      totalPrices,
      activeProduct
    );
  };
  const handleClick = () => {
    // Rotate the icon by 90 degrees
    setRotation(rotation + 90);
  };

  return (
    <Box className='mt-4' h='100%' bg='#FFFFFF'>
      <Grid
        templateAreas={`"leftSide header rightSide"
                  "leftSide main rightSide"`}
        gridTemplateRows={"50px 1fr"}
        gridTemplateColumns={productsDrawerIsOpen ? "290px 1fr" : "55px 1fr"}
        h='100%'
      >
        <GridItem p={"10px 12px"} bg='#FCFCFA' area={"header"}>
          <Flex justifyContent='space-between' alignItems='center'>
            <Text fontSize='p4'>
              <b>Selected Size</b>: {options.size.value}
            </Text>

            <HStack spacing='15px' mb='10px'>
              <Button size='sm' onClick={() => setWatermark(!waterMark)}>
                Show/Hide Watermark
              </Button>
              <DeleteIcon
                fontSize='20px'
                cursor='pointer'
                onClick={() => {
                  wrappedState.removeAllProducts();
                  setWatermark(false);
                }}
              />

              <BiRotateRight
                size={25}
                style={{
                  cursor: "pointer",
                }}
                onClick={handleClick}
              />

              <TbLayoutSidebarLeftCollapse
                fontSize='23px'
                cursor='pointer'
                onClick={() => {
                  setIsOpen(!isOpen);
                }}
              />
            </HStack>
          </Flex>
        </GridItem>
        <GridItem
          px='1'
          bg='#121212'
          area={"leftSide"}
          ref={refSelectedSideList}
        >
          <SideMenu
            heightSelectedSideList={heightSelectedSideList}
            selectedImages={selectedImages}
            selectedImageId={selectedImageId}
            selectedProductId={selectedProductId}
            roomId={roomId}
            switchView={switchView}
            productsDrawerIsOpen={productsDrawerIsOpen}
          />
          <Flex
            cursor='pointer'
            marginTop={"16px"}
            alignSelf={"baseline"}
            alignItems={"center"}
            justifyContent={"flex-start"}
            gap={4}
            borderRadius='4px'
            padding={"16px"}
            onClick={() => {
              setProductsDrawerIsOpen(!productsDrawerIsOpen);
            }}
            sx={{
              ":hover": {
                backgroundColor: "#33322F",
              },
            }}
          >
            <TbLayoutSidebarLeftCollapse fontSize='23px' color='#FFFFFF' />
            {productsDrawerIsOpen && (
              <Text fontSize={"p7"} color={"#FFFFFF"}>
                Collapse Drawer
              </Text>
            )}
          </Flex>
        </GridItem>
        <GridItem bg='#FFFFFF' area={"main"} ref={refMainView}>
          {props.productsDetails.length > 0 ? (
            <MainView
              frameWidth={frameWidth* (calibrationCheck ? selectedPixel : pixelPerInches)}
              widthView={widthView}
              selectedImage={selectedImage}
              selectedImageId={selectedImageId}
              heightMainView={heightMainView}
              width={width}
              frameImageUrl={options.frame.img}
              matting={options.matting.colorCode}
              length={length}
              targetWidth={targetWidth}
              rotation={rotation}
              targetHeight={targetHeight}
              selectedProductId={selectedProductId}
              waterMark={waterMark}
              roomId={roomId}
              switchView={switchView}
              AutoFrameHeight={
                length.get() *
                (calibrationCheck ? selectedPixel : pixelPerInches)
              }
              AutoFrameWidth={
                width.get() *
                (calibrationCheck ? selectedPixel : pixelPerInches)
              }
            />
          ) : (
            <Center mt='70px' minH='400px' flexDirection='column'>
              <BsCartPlusFill size='40px' />
              <Text fontSize='h5' fontWeight='semibold'>
                No product availabe to apply
              </Text>
              <Box paddingTop='16px'>
                <Button
                  size='sm'
                  onClick={() => {
                    navigate(
                      `${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.SETTINGS}/${ROUTE_PATHS.PRODUCTS}`
                    );
                  }}
                >
                  Go to products
                </Button>
              </Box>
            </Center>
          )}
        </GridItem>
        <GridItem bg='white' area={"rightSide"} h={"100%"}>
          <RightToolBar
            heightMainView={heightMainView}
            isOpen={isOpen}
            selectedImage={selectedImage}
            switchView={switchView}
            addProduct={handleAddProduct}
            activeProduct={activeProduct.title}
            handleProductClick={handleProductClick}
            props={props}
            productReservedOptions={productReservedOptions}
            productRegularOptions={productRegularOptions}
            size={options.size.value}
            frame={options.frame.value}
            matting={options.matting.value}
            handleRegularOptionsClick={handleRegularOptionsClick}
            handleReservedOptionsClick={handleReservedOptionsClick}
            setFrameWidth={setFrameWidth}
            frameWidth={frameWidth}
            setWidthView={setWidthView}
          />
        </GridItem>
      </Grid>
    </Box>
  );
};

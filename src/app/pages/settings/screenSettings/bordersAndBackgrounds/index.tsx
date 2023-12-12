import React, { useContext, useState } from "react";
import {
  GridItem,
  HStack,
  VStack,
  CardHeader,
  Card,
  Checkbox,
  Divider,
  CardBody,
  Slider,
  Text,
  Box,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Image,
  Center,
  Tooltip,
} from "@chakra-ui/react";
import { GrFormUp, GrFormDown } from "react-icons/gr";
import { useGlobalState } from "../../../../../state/store";
import { ColorPicker } from "../../../../components/shared/colorPicker";
import { UserPermissions } from "../../../../routes/permissionGuard";
import Swal from "sweetalert2";
const sceneImage = require("./../../../../../assets/scene.jpeg");
// const wallpaper = require("./../../../../../assets/dummyPic.jpg");
export function BordersAndBackgrounds() {
  const { userPermissions } = useContext(UserPermissions);
  const {
    setLayoutsOpening,
    setLayoutsThumbnails,
    setFramesOpening,
    setToggle,
    getToggle,
    setBackgroundColorForImage,
    getBackgroundColorForImage,
  } = useGlobalState();
  const {
    setInputValueImageBorders,
    setOpacity,
    getOpacity,
    setSize,
    getSize,
  } = useGlobalState();
  const [showTooltip, setShowTooltip] = useState(false);
  const [colorBackGround, setColorBackground] = useState("#000000");
  const handleImageBorder = (e) => {
    setInputValueImageBorders(e);
  };
  const handleLayoutOpenings = (e) => {
    setLayoutsOpening(e.target.checked);
  };
  const handleLayoutThumbnails = (e) => {
    setLayoutsThumbnails(e.target.checked);
  };
  const handleFramesOpenigs = (e) => {
    setFramesOpening(e.target.checked);
  };
  const handleToggle = (e) => {
    setToggle(e.target.checked);
  };

  const handleColorChange = (e) => {
    if (userPermissions.fullAccess || userPermissions.edit) {
      setBackgroundColorForImage(e);
    } else
      Swal.fire({
        icon: "error",
        title: "Not Allowed",
        text: "You are not allowed to make changes to this page",
      });
  };
  const handleColorChangeBackground = (e) => {
    if (userPermissions.fullAccess || userPermissions.edit) {
      setColorBackground(e);
    } else
      Swal.fire({
        icon: "error",
        title: "Not Allowed",
        text: "You are not allowed to make changes to this page",
      });
  };
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `${r}, ${g}, ${b}`;
  };
  const mainCardStyle = {
    padding: "0",
    width: "100%",
    borderRadius: "4px",
    borderColor: "greys.300",
  };
  return (
    <GridItem px='24px' paddingBottom='16px' area={"content"}>
      <Flex>
        <Box width='50%'>
          <VStack width='100%' spacing='12px'>
            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Selection Number Display
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />
              <CardBody>
                <HStack spacing='25px'>
                  <Text fontSize='h7'>Size: </Text>
                  <Slider
                    aria-label='slider-ex-1'
                    defaultValue={getSize()}
                    min={15}
                    onChange={(event) => {
                      setSize(event);
                    }}
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.edit
                        ? false
                        : true
                    }
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg='black'
                      color='white'
                      placement='top'
                      isOpen={showTooltip}
                      label={`${getSize()}%`}
                    >
                      <SliderThumb />
                    </Tooltip>
                  </Slider>
                </HStack>
                <HStack spacing='5px'>
                  <Text fontSize='h8'>Opacity: </Text>
                  <Slider
                    aria-label='slider-ex-1'
                    defaultValue={100}
                    onChange={(event) => setOpacity(event / 100)}
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.edit
                        ? false
                        : true
                    }
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </HStack>
                <HStack>
                  <Text>Color:</Text>
                  <ColorPicker
                    color={getBackgroundColorForImage()}
                    handleChange={handleColorChange}
                  />
                  <Checkbox
                    colorScheme='blackAlpha'
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.edit
                        ? false
                        : true
                    }
                    onChange={handleToggle}
                  />
                  <Text>Toggle</Text>
                </HStack>
              </CardBody>
            </Card>
            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Selection Number Display
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />
              <CardBody>
                <VStack spacing='10px'>
                  <HStack spacing='20px' width='100%'>
                    <Text fontSize='h7'>Image Border: </Text>
                    <Box width='93px'>
                      <NumberInput
                        ml='13px'
                        size='sm'
                        defaultValue={12}
                        max={30}
                        onChange={handleImageBorder}
                        isDisabled={
                          userPermissions.fullAccess || userPermissions.edit
                            ? false
                            : true
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper children={<GrFormUp />} />
                          <NumberDecrementStepper children={<GrFormDown />} />
                        </NumberInputStepper>
                      </NumberInput>
                    </Box>
                  </HStack>
                  <HStack width='100%' spacing='20px'>
                    <Text fontSize='h7'>Titled Image: </Text>
                    <ColorPicker
                      color={colorBackGround}
                      handleChange={handleColorChangeBackground}
                    />
                    <Text fontSize='h7'>Background Color </Text>
                  </HStack>
                  <Flex width='100%'>
                    <Text fontSize='h7' paddingRight='16px'>
                      Layouts:{" "}
                    </Text>{" "}
                    <VStack spacing='20px' width='100%' alignItems='flex-start'>
                      <Flex>
                        <Checkbox
                          colorScheme='blackAlpha'
                          onChange={handleLayoutOpenings}
                          isDisabled={
                            userPermissions.fullAccess || userPermissions.edit
                              ? false
                              : true
                          }
                        />
                        <Text>Show X in Empty Openings</Text>
                      </Flex>
                      <Flex>
                        <Checkbox
                          isDisabled={
                            userPermissions.fullAccess || userPermissions.edit
                              ? false
                              : true
                          }
                          colorScheme='blackAlpha'
                          onChange={handleLayoutThumbnails}
                        />
                        <Text>Show X in Empty Thumbnails</Text>
                      </Flex>
                    </VStack>
                  </Flex>
                  <Flex width='100%'>
                    <Text fontSize='h7' paddingRight='16px'>
                      Frames:{" "}
                    </Text>{" "}
                    <VStack spacing='20px' width='100%' alignItems='flex-start'>
                      <Flex>
                        <Checkbox
                          isDisabled={
                            userPermissions.fullAccess || userPermissions.edit
                              ? false
                              : true
                          }
                          colorScheme='blackAlpha'
                          onChange={handleFramesOpenigs}
                        />
                        <Text>Show X in Empty Openings</Text>
                      </Flex>
                    </VStack>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
          {/* Image */}
        </Box>
        <Center width='700px' height='386px'>
          <Box
            width='100%'
            height='100%'
            bg={`rgba(${hexToRgb(
              getBackgroundColorForImage()
            )}, ${getOpacity()})`}
            bgSize='cover'
            bgPosition='center'
            display='flex'
            alignItems='center'
            justifyContent='center'
          >
            <Image
              src='https://picsum.photos/300/200'
              // src={sceneImage}
              // src={wallpaper}
              alt='pic'
              opacity={1}
              width='100%'
              height={`${getSize()}%`}
              maxHeight='100%'
              objectFit='contain'
            />
          </Box>
        </Center>
      </Flex>
    </GridItem>
  );
}

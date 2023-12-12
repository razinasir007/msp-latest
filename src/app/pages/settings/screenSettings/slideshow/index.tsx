import React, { useState, useRef, useEffect, useContext } from "react";
import { AiFillDelete } from "react-icons/ai";
import { BsFillPlayFill } from "react-icons/bs";
import { BiPause } from "react-icons/bi";
import { AudioUploaderModal } from "./../../../../components/settings/projectorSettings/audioUploaderModal";
import ReactHowler from "react-howler";
import { globalState, useGlobalState } from "../../../../../state/store";
import {
  Text,
  GridItem,
  Divider,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Button,
  VStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Checkbox,
  Flex,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { LabeledInput } from "../../../../components/shared/labeledInput";
import { UserPermissions } from "../../../../routes/permissionGuard";
export function Slideshow() {
  const ref: any = useRef();
  const state = useGlobalState();
  const { userPermissions } = useContext(UserPermissions);

  const { setSound, getSound, setContent, getContent, removeAudio, getAudios } =
    useGlobalState();

  const [uploadedAudioCards, setUploadedAudioCards] = useState<any>(
    getAudios()
  );
  const [playAudio, setPlayAudio] = useState(false);
  const [watermarkText, setWaterMarkText] = useState("");
  // const [playingStates, setPlayingStates] = useState(
  //   new Array(uploadedAudioCards.length).fill(false)
  // );
  const mainCardStyle = {
    padding: "0",
    width: "100%",
    borderRadius: "4px",
    borderColor: "greys.300",
  };

  const onPlayClick = (id) => {
    const updatedList = uploadedAudioCards.map((item) => {
      return {
        ...item,
        isSelected: item.id === id,
      };
    });
    setUploadedAudioCards(updatedList);
  };

  const onPauseClick = (id) => {
    const updatedList = uploadedAudioCards.map((item) => {
      return {
        ...item,
        isSelected: false,
      };
    });
    setUploadedAudioCards(updatedList);
  };

  const handleVideoSound = (e) => {
    setSound(e.target.checked);
  };
  const handleAvailableContent = (e) => {
    setContent(e.target.checked);
  };

  return (
    <Box>
      <GridItem px='24px' paddingBottom='16px' area={"content"}>
        <VStack width='100%' spacing='12px'>
          <Card variant='outline' style={mainCardStyle}>
            <CardHeader padding='8px'>
              <Text fontSize='h5' fontWeight='semibold'>
                Options
              </Text>
            </CardHeader>
            <Divider width='100%' opacity={1} />
            <CardBody>
              <VStack spacing='10px'>
                <HStack spacing='46px' width='100%' height='35px'>
                  <Text fontSize='h7'>Video Sound: </Text>
                  <HStack spacing='10px'>
                    <Checkbox
                      colorScheme='blackAlpha'
                      onChange={handleVideoSound}
                      isDisabled={
                        userPermissions.fullAccess || userPermissions.edit
                          ? false
                          : true
                      }
                    />
                    <Text>Turn off when adding to slideshow</Text>
                  </HStack>
                </HStack>
                <HStack spacing='9px' width='100%'>
                  <Text fontSize='h7'>Available Content: </Text>
                  <Checkbox
                    colorScheme='blackAlpha'
                    onChange={handleAvailableContent}
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.edit
                        ? false
                        : true
                    }
                  />
                  <Text>Turn off when adding to slideshow</Text>
                </HStack>
                <HStack spacing='17px' width='100%'>
                  <Text fontSize='h7'>Default Playback: </Text>
                  <Button
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.edit
                        ? false
                        : true
                    }
                    colorScheme='gray'
                    variant='outline'
                    onClick={() => {
                      alert("Triggered");
                    }}
                  >
                    Quick Slideshow
                  </Button>
                </HStack>

                <HStack spacing='9px' width='100%'>
                  <Text fontSize='h7' w='145px' mb='10px'>
                    Watermark Text :
                  </Text>
                  <LabeledInput
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.edit
                        ? false
                        : true
                    }
                    containerHeight='55px'
                    width='300px'
                    name='phoneNumber'
                    defaultValue={state.getWatermarkText()}
                    placeholder='Watermark Text...'
                    onChange={(e) => setWaterMarkText(e.target.value)}
                  />
                </HStack>
                <Button
                  isDisabled={
                    userPermissions.fullAccess || userPermissions.edit
                      ? false
                      : true
                  }
                  size='sm'
                  onClick={() => state.setWatermarkText(watermarkText)}
                >
                  Apply
                </Button>
              </VStack>
            </CardBody>
          </Card>
          <Card variant='outline' style={mainCardStyle}>
            <CardHeader padding='8px'>
              <Text fontSize='h5' fontWeight='semibold'>
                Audio
              </Text>
            </CardHeader>
            <Divider width='100%' opacity={1} />
            <CardBody>
              <VStack width='100%'>
                <HStack width='100%'>
                  <Text fontSize='h7'>Audio Files</Text>
                </HStack>
                <HStack width='100%'>
                  <AudioUploaderModal
                    setUploadedAudioCards={setUploadedAudioCards}
                  />
                </HStack>
                <HStack width='100%'>
                  <Box width='800px'>
                    <TableContainer>
                      <Table size='lg'>
                        <Thead>
                          <Tr>
                            <Th>File Name</Th>
                            <Th>Play/Pause</Th>
                            <Th>Size</Th>
                            <Th>Type</Th>
                            <Th>Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {uploadedAudioCards ? (
                            uploadedAudioCards.map((item) => (
                              <Tr key={item.id}>
                                <Td>{item.filename}</Td>
                                <Td>
                                  {item.isSelected ? (
                                    <BiPause size={22} onClick={onPauseClick} />
                                  ) : (
                                    <BsFillPlayFill
                                      size={18}
                                      onClick={() => onPlayClick(item.id)}
                                    />
                                  )}
                                </Td>
                                <Td>{item.size}</Td>
                                <Td>{item.type}</Td>
                                <Td>
                                  <AiFillDelete
                                    size={22}
                                    onClick={() => {
                                      // alert(item.filename);
                                      setUploadedAudioCards(
                                        uploadedAudioCards.filter(
                                          (ele) => ele.id !== item.id
                                        )
                                      );
                                      removeAudio(item);
                                    }}
                                  />
                                </Td>
                                <Td>
                                  <ReactHowler
                                    src={item.base64}
                                    playing={item.isSelected}
                                    onPlay={() =>
                                      setTimeout(() => {
                                        setPlayAudio(false);
                                      }, 7000)
                                    }
                                    onEnd={() => setPlayAudio(false)}
                                  />
                                </Td>
                              </Tr>
                            ))
                          ) : (
                            <Text>No Fiels Uploaded Yet</Text>
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                </HStack>
                <HStack width='100%'>
                  <Checkbox
                    colorScheme='blackAlpha'
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.edit
                        ? false
                        : true
                    }
                  ></Checkbox>
                  <Text>Auto Play</Text>
                </HStack>
                <HStack width='100%'>
                  <Checkbox
                    colorScheme='blackAlpha'
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.edit
                        ? false
                        : true
                    }
                  ></Checkbox>
                  <Text>Repeat Play</Text>
                </HStack>
                <HStack width='100%'>
                  <Text>Volume:</Text>
                  <Flex width='100px' alignItems='center'>
                    <Slider
                      aria-label='slider-ex-1'
                      defaultValue={30}
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
                  </Flex>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
          <Card variant='outline' style={mainCardStyle}>
            <CardHeader padding='8px'>
              <Text fontSize='h5' fontWeight='semibold'>
                Performance
              </Text>
            </CardHeader>
            <Divider width='100%' opacity={1} />
            <CardBody>
              <VStack width='100%'>
                <HStack width='100%'>
                  <Checkbox
                    colorScheme='blackAlpha'
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.edit
                        ? false
                        : true
                    }
                  ></Checkbox>
                  <Text>Pre-buffer Layouts, Pages & Rooms</Text>
                </HStack>
                <HStack width='100%'>
                  <Checkbox
                    colorScheme='blackAlpha'
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.edit
                        ? false
                        : true
                    }
                  ></Checkbox>
                  <Text>Use Metal</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </GridItem>
    </Box>
  );
}

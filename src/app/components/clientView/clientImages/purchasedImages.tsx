import React from "react";
import {
  SkeletonText,
  Flex,
  SimpleGrid,
  VStack,
  Box,
  Text,
  Image,
} from "@chakra-ui/react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { FullScreen } from "react-full-screen";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { MdClose } from "react-icons/md";

export const PurchasedImages = React.forwardRef(
  (
    props: {
      OrderLoading;
      presentationModePurchased?;
      viewImagePurchased?;
      setViewImagePurchased?;
      setLaunchPresentationModePurchased?;
      handle;
      handleChange;
      ref;
      isFullScreen;
      fullscreen;
      purchasedPhotos;
      slideShowIndexPurchased;
      serachItem;
      handleDoubleClickPurchased;
    },
    ref: React.Ref<any>
  ) => {
    return (
      <Box mt='20px'>
        {props.OrderLoading ? (
          <Box
            padding='6'
            boxShadow='lg'
            bg='greys.400'
            width='100%'
            minH='235px'
            maxH='235px'
            mt='20px'
            borderRadius='4px'
          >
            <SkeletonText mt='4' noOfLines={5} spacing='4' skeletonHeight='5' />
          </Box>
        ) : props.presentationModePurchased || props.viewImagePurchased ? (
          <>
            <Flex justifyContent='space-between' mb='20px' mt='20px'>
              <Text fontSize='h5' fontWeight='400'>
                Presentation View For Purchased Images
              </Text>
              <MdClose
                size={30}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  props.viewImagePurchased
                    ? props.setViewImagePurchased(false)
                    : props.setLaunchPresentationModePurchased(false)
                }
              />
            </Flex>
            <Box>
              <FullScreen handle={props.handle} onChange={props.handleChange}>
                <Splide
                  style={{ height: "500px" }}
                  ref={ref}
                  options={{
                    type: "loop",
                    start: props.viewImagePurchased
                      ? props.slideShowIndexPurchased
                      : 0,
                  }}
                  aria-label='React Splide Example'
                >
                  {props.purchasedPhotos.map((image) => (
                    <SplideSlide key={image.id}>
                      <Flex
                        alignItems='center'
                        justifyContent='center'
                        bg='#FFFAFA'
                        padding='0'
                        height={500}
                      >
                        {!props.isFullScreen.get() && (
                          <BsArrowsAngleExpand
                            onClick={props.fullscreen}
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              cursor: "pointer",
                              color: "darkgrey",
                            }}
                          />
                        )}
                        <Image
                          src={`data:image/png;base64,${image.resizedContent}`}
                          height='100%'
                        />
                      </Flex>
                    </SplideSlide>
                  ))}
                </Splide>
              </FullScreen>
            </Box>
          </>
        ) : (
          <>
            <SimpleGrid columns={4} spacing='20px'>
              {props.purchasedPhotos
                .filter((img) =>
                  img.name
                    .split(".")[0]
                    .toLowerCase()
                    .includes(props.serachItem.toLowerCase())
                )
                .map((ele, index) => (
                  <Box key={ele.id}>
                    <VStack>
                      <img
                        src={`data:image/png;base64,${ele.resizedContent}`}
                        alt='img'
                        height='500px'
                        width='500px'
                        style={{ cursor: "pointer" }}
                        onDoubleClick={() =>
                          props.handleDoubleClickPurchased(index)
                        }
                      />
                      <Text fontSize='p5' fontWeight='400'>
                        {ele.name.split(".")[0]}
                      </Text>
                    </VStack>
                  </Box>
                ))}
            </SimpleGrid>
          </>
        )}
      </Box>
    );
  }
);

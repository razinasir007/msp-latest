import React from "react";
import { Flex, Box, Text, Image } from "@chakra-ui/react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { FullScreen } from "react-full-screen";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { MdClose } from "react-icons/md";
export const RootImagesPresentation = ({
  rootImages,
  viewImageRootImages,
  setViewImageRootImages,
  setLaunchPresentationModeAll,
  isFullScreen,
  fullscreen,
  handleChange,
  handle,
  slideShowIndexRootImages,
}) => {
  return (
    <>
      <Flex justifyContent='space-between' mb='20px' mt='20px'>
        <Text fontSize='h5' fontWeight='400'>
          Presentation View
        </Text>
        <MdClose
          size={30}
          style={{ cursor: "pointer" }}
          onClick={() =>
            viewImageRootImages
              ? setViewImageRootImages(false)
              : setLaunchPresentationModeAll(false)
          }
        />
      </Flex>
      <Box>
        <FullScreen handle={handle} onChange={handleChange}>
          <Splide
            style={{ height: "500px" }}
            options={{
              type: "loop",
              start: viewImageRootImages ? slideShowIndexRootImages : 0,
            }}
            aria-label='React Splide Example'
          >
            {rootImages.map((image, index) => {
              return (
                <SplideSlide key={image.id}>
                  <Flex
                    alignItems='center'
                    justifyContent='center'
                    bg='#FFFAFA'
                    padding='0'
                    height={500}
                  >
                    {!isFullScreen.get() && (
                      <BsArrowsAngleExpand
                        onClick={() => fullscreen()}
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
              );
            })}
          </Splide>
        </FullScreen>
      </Box>
    </>
  );
};

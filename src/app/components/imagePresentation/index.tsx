import React, { useEffect, useRef, useState } from "react";
import { globalState } from "../../../state/store";
import { ImmutableArray, useHookstate } from "@hookstate/core";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/dist/css/splide.min.css";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { AudioPlayer } from "../audioPlayer";
import { Box, Button, Center, Flex, Image, Text } from "@chakra-ui/react";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { useGlobalState } from "../../../state/store";
import { UploadedPhoto } from "../../../state/interfaces";
import { WatermarkedImage } from "../shared/watermarkedImage";
import { useLazyQuery } from "@apollo/client";
import { GetResizedAndThumbnailImage } from "../../../apollo/orderQueries";
import { SLIDESHOW_INTERVAL } from "../../../constants";

export const PresentationView = (props) => {
  const { getSize, getBackgroundColorForImage, getOpacity } = useGlobalState();
  const wrappedState = useHookstate(globalState);
  const stateUser = useHookstate(globalState.user);
  const [heightSlideShow, setHeightSlideShow] = useState<any>("100%");
  const [showWaterMark, setShowWaterMark] = useState(false);
  const ref: any = useRef();
  const wrapState = useGlobalState();
  const refSlideShow = useRef<any>();
  const handle = useFullScreenHandle();
  const state = useHookstate(globalState);
  const height = useHookstate("500px");
  const isFullScreen = useHookstate(false);
  const slideInterval = useHookstate(NaN);
  const isPresenting = useHookstate(false);
  const images: ImmutableArray<UploadedPhoto> = state.presentationImages.get();

  const [
    getThumbnailandResizedImage,
    {
      data: ResizedImageData,
      loading: ResizedImageLoading,
      error: ResizedImageError,
    },
  ] = useLazyQuery(GetResizedAndThumbnailImage);

  useEffect(() => {
    for (const image of images) {
      if (!image.resizedBase64) {
        getThumbnailandResizedImage({
          variables: {
            id: image.id,
            photoType: "RESIZED",
          },
        })
          .then(({ data }) => {
            if (
              data.photos.lookup.content !== "" &&
              data.photos.lookup.content !== null
            ) {
              wrappedState.presentationImages.set((prevImages) => {
                const updatedImages = prevImages.map((prevImage) =>
                  prevImage.id === image.id
                    ? {
                        ...prevImage,
                        resizedBase64: `data:image/png;base64,${data.photos.lookup.content}`,
                      }
                    : prevImage
                );
                return updatedImages;
              });
            }
          })
          .catch((err) => {
            console.log("error", err);
          });
      }
    }
  }, []);

  useEffect(() => {
    function handleWindowResize() {
      if (refSlideShow.current)
        setHeightSlideShow(refSlideShow.current.clientHeight - 166);
    }
    setHeightSlideShow(refSlideShow.current.clientHeight - 166);
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  });
  function fullscreen() {
    handle.enter();
    height.set("100%");
  }
  function handleChange(state: boolean) {
    isFullScreen.set(state);
    if (!state) {
      clearInterval(slideInterval.get());
      isPresenting.set(false);
    }
  }
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `${r}, ${g}, ${b}`;
  };
  function next() {
    ref.current.splide.go(">");
  }

  function startPresentation() {
    isPresenting.set(true);
    // 1.) fullscreen the slideshow
    fullscreen();
    // 2.) start autoplaying
    slideInterval.set(Number(setInterval(() => next(), SLIDESHOW_INTERVAL)));
  }

  function getImageHeight() {
    if (isFullScreen.get()) {
      return "100vh";
    } else {
      return heightSlideShow;
    }
  }

  return (
    <Box
      ref={refSlideShow}
      className='mt-4'
      h='100%'
      bg='#FCFCFA'
      style={{
        paddingTop: "20px",
        paddingLeft: "20px",
        paddingRight: "20px",
        overflow: "hidden",
      }}
    >
      <Flex width='100%' justifyContent='space-between'>
        <Text fontSize='lg' as='b'>
          Presentation
        </Text>
        <Button
          mb='5px'
          size='sm'
          onClick={() => setShowWaterMark(!showWaterMark)}
        >
          Show/Hide Watermark
        </Button>
      </Flex>
      <Box>
        <FullScreen handle={handle} onChange={handleChange}>
          <Splide
            style={{ height: getImageHeight() }}
            ref={ref}
            options={{
              type: "fade",
              rewind: true,
            }}
            aria-label='React Splide Example'
          >
            <SplideSlide>
              <Center
                className='center'
                bg='black'
                padding='0'
                height={getImageHeight()}
              >
                <Text
                  color='white'
                  fontSize='p1'
                  fontWeight='bold'
                  fontStyle='italic'
                >
                  {props.clientFullName}
                </Text>
              </Center>
            </SplideSlide>
            {images.map((image) => (
              <SplideSlide
                key={image.id}
                className="fullscreen-slide"
              >
                <Center
                  className='imageCenter'
                  // alignItems="center"
                  // justifyContent="center"
                  bg={`rgba(${hexToRgb(
                    getBackgroundColorForImage()
                  )}, ${getOpacity()})`}
                  padding='0'
                  height={getImageHeight()}
                >
                  {!isFullScreen.get() && (
                    <BsArrowsAngleExpand
                      onClick={fullscreen}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        cursor: "pointer",
                        color: "darkgrey",
                      }}
                    />
                  )}
                  {/* <Image src={image.base64} height={`${getSize()}%`} /> */}
                  <Box maxWidth={isFullScreen.get() ? "70%" : "50%"}>
                    <WatermarkedImage
                      src={image.resizedBase64}
                      height={`${getSize()}%`}
                      watermarkText={
                        wrapState.getWatermarkText() === ""
                          ? stateUser.value?.organization?.name
                          : wrapState.getWatermarkText()
                      }
                      showWaterMark={showWaterMark}
                    />
                  </Box>
                </Center>
              </SplideSlide>
            ))}
          </Splide>
        </FullScreen>
      </Box>
      <Flex
        height='60px'
        width='100%'
        justifyContent='center'
        alignItems='center'
      >
        <AudioPlayer isPresenting={isPresenting.get()} />
      </Flex>
      <Flex
        height='45px'
        width='100%'
        justifyContent='center'
        alignItems='center'
      >
        <Button size='sm' onClick={() => startPresentation()}>
          Start
        </Button>
      </Flex>
    </Box>
  );
};

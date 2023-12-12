import { useHookstate } from "@hookstate/core";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { globalState, useGlobalState } from "../../../state/store";
import { getFrameThickness, adjustFrameDimensions } from "./frameUtils";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  transform: ${({ rotation }) =>
    `rotate(${rotation}deg)`}; // Apply rotation here
  transition: "transform 0.3s ease-in-out"; // Add a smooth transition
  pointer-events: none;
`;

const Frame = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  transform: rotate(${({ rotate }) => rotate}deg);
  object-fit: contain;
`;

const Image = styled.img`
  position: relative;
  z-index: 1;
  margin: ${({ frameThickness }) => frameThickness}px;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  transform: rotate(${({ rotate }) => rotate}deg);
  object-fit: ${({ objectFit }) => objectFit};
  pointer-events: none;
`;

const Background = styled.div`
  position: absolute;
  z-index: 0;
  background-color: ${({ bgColor }) => bgColor};
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;

const detectOrientation = (width, height) => {
  return width > height ? "landscape" : "portrait";
};

export const AutoFrame = ({
  selectedId,
  productId,
  matting,
  imageURL,
  frameImageURL,
  width,
  height,
  waterMark,
  rotation,
  view,
  frameWidth,
  widthView,
}) => {
  const targetOrientation = detectOrientation(width, height);
  const [frameThickness, setFrameThickness] = useState(0);
  const [scaledFrameSize, setScaledFrameSize] = useState({ width, height });
  const [imageDimensions, setImageDimensions] = useState({ width, height });
  const [imageRotation, setImageRotation] = useState(0);
  const [frameRotation, setFrameRotation] = useState(0);
  const stateUser = useHookstate(globalState.user);
  const state = useGlobalState();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // add a new piece of state to store the orientation
  const [orientation, setOrientation] = useState(
    detectOrientation(width, height)
  );

  const imageRef = useRef(null);
  const frameRef = useRef(null);

  const rotateImage = () => {
    updateFrameDimensions();

    if (!imageRef.current) {
      return;
    }

    const imgOrientation = detectOrientation(
      imageRef.current.naturalWidth,
      imageRef.current.naturalHeight
    );

    if (targetOrientation !== imgOrientation) {
      setImageRotation(90);
      setImageDimensions({ width: height, height: width });
    } else {
      setImageRotation(0);
      setImageDimensions({ width: width, height: height });
    }
  };

  const handleImageLoad = (event) => {
    rotateImage();
  };

  const updateFrameDimensions = async () => {
    if (frameRef.current) {
      setIsReady(false);
      setLoading(true); // Set loading to true when starting loading and resizing

      const frameOrientation = detectOrientation(
        frameRef.current.naturalWidth,
        frameRef.current.naturalHeight
      );
      let frameDimensions = {
        width: frameRef.current.naturalWidth,
        height: frameRef.current.naturalHeight,
      };

      if (frameOrientation !== targetOrientation) {
        setFrameRotation(90);
        frameDimensions = {
          width: frameDimensions.height,
          height: frameDimensions.width,
        };
      } else {
        setFrameRotation(0);
      }

      let thickness = await getFrameThickness(frameRef.current.src);
      let adjusted = adjustFrameDimensions(
        frameDimensions.width,
        frameDimensions.height,
        thickness,
        width,
        height
      );

      // Calculate the adjusted frame dimensions by adding the double thickness
      let { height: adjustedHeight, width: adjustedWidth } = adjusted;

      // Set the frame thickness state
      setFrameThickness(thickness);

      setScaledFrameSize({
        width: frameRotation === 0 ? adjustedWidth : adjustedHeight,
        height: frameRotation === 0 ? adjustedHeight : adjustedWidth,
      });

      // After calculations are done, wait for the image to load, and then for at least half a second before hiding the loading skeleton
      // The Promise.all will ensure that both conditions are met before calling setIsReady
      Promise.all([
        new Promise((resolve) => setTimeout(resolve, 1000)), // This Promise resolves after 1 second
        new Promise((resolve) => {
          // This Promise resolves when the loading state is set to false
          const intervalId = setInterval(() => {
            if (!loading) {
              clearInterval(intervalId);
              resolve("done");
            }
          }, 100);
        }),
      ]).then(() => {
        setLoading(false); // Set loading to false when image has finished loading
        setIsReady(true); // Hide the skeleton only when both conditions are met
      });
    }
  };

  // update the orientation whenever the width or height props change
  useEffect(() => {
    setOrientation(detectOrientation(width, height));
  }, [width, height]);

  // reload the image/frame whenever the orientation changes
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      rotateImage(true);
    }
  }, [orientation]);

  useEffect(() => {
    if (frameRef.current && frameRef.current.complete) {
      updateFrameDimensions();
    }
  }, [orientation]);

  useEffect(() => {
    if (frameRef.current && frameRef.current.complete) {
      rotateImage();
    }
  }, [frameImageURL, width, height]);

  const handleFrameLoad = () => {
    if (frameRef.current) {
      updateFrameDimensions();
    }
  };

  let avgWidth = scaledFrameSize.width * 0.9;
  let avgHeight = scaledFrameSize.height * 0.9;

  if (frameRotation === 90) {
    let tmp = avgWidth;
    avgWidth = avgHeight;
    avgHeight = tmp;
  }

  return (
    <>
      {widthView === false &&
      frameImageURL &&
      frameImageURL !== "data:image/png;base64," ? (
        <Container
          width={scaledFrameSize.width}
          height={scaledFrameSize.height}
          rotation={rotation}
        >
          {/* {!isReady && (
        <Skeleton
          width={scaledFrameSize.width}
          height={scaledFrameSize.height}
          style={{ position: "absolute", zIndex: 30, opacity: 1 }}
        />
      )} */}

          <Background
            // style={{ opacity: isReady ? 1 : 0 }} // make sure we don't see the background flashing while loading
            bgColor={matting}
            width={avgWidth}
            height={avgHeight}
          />

          <Frame
            ref={frameRef}
            src={frameImageURL}
            alt='Frame'
            rotate={frameRotation}
            width={scaledFrameSize.width}
            height={scaledFrameSize.height}
            onLoad={handleFrameLoad}
            style={{
              boxShadow:
                view === "room" || view === "customRoom"
                  ? productId === selectedId
                    ? "3px 3px 10px black"
                    : "none"
                  : "none",
            }}
          />

          <Image
            ref={imageRef}
            src={imageURL}
            alt='Photograph'
            objectFit='contain'
            rotate={imageRotation}
            width={imageDimensions.width}
            height={imageDimensions.height}
            frameThickness={frameThickness}
            onLoad={handleImageLoad}
          />

          {waterMark && (
            <div
              style={{
                position: "absolute",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                left: "16%",
                fontSize: imageDimensions.height < 100 ? "9px" : "25px",
                color: "rgba(255, 255, 255, 0.8)",
                fontStyle: "italic",
                padding: "10px",
                maxWidth: "72%",
                zIndex: 2,
              }}
            >
              {state.getWatermarkText() === ""
                ? stateUser.value?.organization?.name
                : state.getWatermarkText()}
            </div>
          )}
        </Container>
      ) : widthView ? (
        <Container rotation={rotation}>
          <Image
            ref={imageRef}
            src={imageURL}
            alt='Photograph'
            objectFit='cover'
            height={imageDimensions.height}
            width={imageDimensions.width}
            onLoad={handleImageLoad}
            style={{
              border: `solid black ${frameWidth}px`,
            }}
          />
        </Container>
      ) : (
        <Container
          width={scaledFrameSize.width}
          height={scaledFrameSize.height}
          rotation={rotation}
          style={{
            border:
              view === "room" || view === "customRoom"
                ? productId === selectedId
                  ? "4px solid black"
                  : "none"
                : "none",
          }}
        >
          <Image
            src={imageURL}
            height={height}
            width={width}
            rotate={rotation}
            objectFit='contain'
          />
        </Container>
      )}
    </>
  );
};

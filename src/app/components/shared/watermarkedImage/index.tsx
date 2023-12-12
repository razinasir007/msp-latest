import React, { useState } from "react";
import styled from "styled-components";
import { Image } from "@chakra-ui/react";

export const WatermarkedImage = (props: {
  src;
  watermarkText;
  height;
  showWaterMark;
}) => {
  const [loaded, setLoaded] = useState(false);
  const handleImageLoad = () => {
    setLoaded(true);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Image
        src={props.src}
        alt='Image'
        height={props.height}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.5s" }}
        onLoad={handleImageLoad}
        // frameThickness={props.frameThickness}
      />
      {loaded && props.showWaterMark && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            fontSize: "30px",
            color: "rgba(255, 255, 255, 0.8)",
            fontStyle: "italic",
            padding: "10px",
            width: "450px",
            // backdropFilter: "blur(5px)",
            // backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          {props.watermarkText}
        </div>
      )}
    </div>
  );
};

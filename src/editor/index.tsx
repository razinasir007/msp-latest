import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { UploadedPhoto } from "../state/interfaces";
import { useGlobalState } from "../state/store";
import { FilerobotVewer } from "./filerobot";

export const Editor = () => {
  const state = useGlobalState();
  let images = state.getSelectedImages();

  const [selectedImage, setSelectedImage] = useState<UploadedPhoto | undefined>(
    undefined
  );

  function select(image: UploadedPhoto) {
    setSelectedImage(image);
  }

  return (
    <Row>
      <Col xs={3}>
        <div style={{ height: 500, overflowY: "scroll" }}>
          {images.map((image) => (
            <img
              src={image.base64}
              alt={"not found"}
              loading='lazy'
              onClick={() => select(image)}
              style={{
                cursor: "pointer",
                width: "100%",
                borderRadius: 4,
                marginTop: 5,
              }}
            />
          ))}
        </div>
      </Col>
      <Col xs={9}>{FilerobotVewer(selectedImage)}</Col>
    </Row>
  );
};

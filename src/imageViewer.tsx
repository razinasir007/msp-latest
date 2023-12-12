import React, { useState } from 'react';

import "./imageViewer.scss";

import { Slider, TextField, Paper } from '@mui/material';
import ImageEditor from '@toast-ui/react-image-editor';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import 'tui-image-editor/dist/tui-image-editor.css';
import { DivDropper } from './uploader/dropper';

export default function ImageView() {

  const [selectedImage, setSelectedImage] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [inchesLength, setInchesLength] = useState(0);

  const [width, setWidth] = useState(8);
  const [length, setLength] = useState(10);

  //  3.37 inches and 2.125
  const pixelLength = 150

  const currentLength = pixelLength + (sliderValue / 100) * pixelLength;
  const pixelRatio = currentLength / inchesLength;
  
  // For whatever reason, we need to add 3/4 of an inch every time to the width to get the "true to size" width 
  const targetWidth = width * pixelRatio
  const targetHeight = length * pixelRatio


  // let editorRef = React.createRef();

  // const handleClickButton = () => {
  //     const editor = editorRef.current.getInstance();
  //     editor.loadImageFromURL('https://picsum.photos/200/300', 'lena').then(() => console.log("loaded image!"))
  // };


  function select(image) {
    setSelectedImage(image)
    // const editor = editorRef.current.getInstance();
    // editor.loadImageFromFile(image).then(console.log)
  }
  return (

    <div className="">
      <Row>
        <Col sm={3}>

          <Paper elevation={3} className="p-4 ms-4 mt-4">
            <p>Drag & Drop Images below</p>
            {DivDropper(select)}
          </Paper>

        </Col>

        <Col sm={9}>

          <Paper elevation={3} className="p-4 me-4 mt-4">
            <Row>
              <p>Calibrate Settings</p>

              <Row>

                <Col sm={4}>

                  <Row>
                    <Col>
                      <TextField
                        style={{ width: 300 }}
                        label="How long is the black line in Inches?"
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        defaultValue={inchesLength}
                        onChange={(event) => {
                          const updatedValue = parseFloat(event.target.value);
                          if (updatedValue) {
                            setInchesLength(updatedValue)
                          }
                        }}
                      />
                    </Col>
                  </Row>


                  <Row className="mt-2">
                    <p>Target Dimensions (W x L)</p>

                    <Col>
                      <TextField
                        className=""
                        label="Width in Inches"
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        defaultValue={width}
                        onChange={(event) => {
                          const updatedValue = parseFloat(event.target.value);
                          if (updatedValue) {
                            setWidth(updatedValue)
                          }
                        }}
                      />
                    </Col>
    
                    <Col>
                      <TextField
                        className=""
                        label="Length in Inches"
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        defaultValue={length}
                        onChange={(event) => {
                          const updatedValue = parseFloat(event.target.value);
                          if (updatedValue) {
                            setLength(updatedValue)
                          }
                        }}
                      />
                    </Col>

                  </Row>


                </Col>

                <Col>

                  <p className="mb-3">Reference Line: {currentLength} px (<i>{(pixelRatio).toFixed(2)} pixels/inch</i>)</p>
                  <div className="calibration mb-2" style={{ width: currentLength }} />

                  <Row>
                    <Col>
                      <Slider
                        style={{ width: 150 }}
                        defaultValue={0}
                        aria-label="Default"
                        valueLabelDisplay="auto"
                        onChange={(event, value, activeThumb) => {
                          setSliderValue(value as number)
                        }}
                      />
                    </Col>
                  </Row>

                </Col>

              </Row>

            </Row>
            </Paper>

            <Paper elevation={3} className="p-4 me-4 mt-4">
              <p>Selected Image</p>
              <Row className="mt-4">
                <Col>
                {selectedImage && <img id={"selected-image"} src={URL.createObjectURL(selectedImage)} style={{ width: targetWidth, height: targetHeight, padding: 0}} />}

                </Col>
              {/* {FilerobotVewer(selectedImage) } */}
              {/* { MyComponent(editorRef) } */}
              </Row>
            </Paper>

        </Col>
      </Row>
    </div>
  )
}


function MyComponent(ref) {
  return (
    <ImageEditor
      ref={ref}
      includeUI={{
        loadImage: {
          path: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          name: 'Blank'
        },
        // menu: ['shape', 'filter'],
        initMenu: 'filter',
        uiSize: {
          height: '100vh',
        },
        menuBarPosition: 'right',
      }}
      selectionStyle={{
        cornerSize: 20,
        rotatingPointOffset: 70,
      }}
      usageStatistics={true}
    />
  )
}


const UploadMultipleDisplayImage = () => {
  const [images, setImages] = useState([]);

  function removeImage(image: File) {
    setImages(images.filter((current: File) => current.name !== image.name))
  }

  return (
    <div>

      <label for="file-upload" class="custom-file-upload">
        <i class="fa fa-cloud-upload"></i> Custom Upload
      </label>
      <input
        id="file-upload"
        type="file"
        name="myImage"
        multiple={true}
        onChange={(event: any) => {
          console.log(event.target.files);
          setImages([...images, ...Array.from(event.target.files)]);
        }}
      />

      {images.map(selectedImage => (
        <div key={selectedImage.name}>
          <img alt="not fount" width={"250px"} src={URL.createObjectURL(selectedImage)} />
          <br />
          <button onClick={() => removeImage(selectedImage)}>Remove</button>
        </div>
      ))}
      <br />

    </div>
  );
};


const UploadAndDisplayImage = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div>
      <h1>Upload and Display Image usign React Hook's</h1>
      {selectedImage && (
        <div>
          <img alt="not fount" width={"250px"} src={URL.createObjectURL(selectedImage)} />
          <br />
          <button onClick={() => setSelectedImage(null)}>Remove</button>
        </div>
      )}
      <br />

      <br />
      <input
        type="file"
        name="myImage"
        multiple={true}
        onChange={(event: any) => {
          console.log(event.target.files[0]);
          setSelectedImage(event.target.files[0]);
        }}
      />
    </div>
  );
};



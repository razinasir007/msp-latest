import React, { useRef, useEffect, useState } from "react";
import { Box, Button, Input, VStack, Center } from "@chakra-ui/react";
import SignaturePad from "signature_pad";

export function Signature(props) {
  //this will be the reference to the canvas
  const canvasRef = useRef(null);
  //state for value of the input field
  const [input, setInput] = useState("");
  //canvas and signaturePad with global scope
  //*this handles canvas and signature pad for draw and type both*
  const [signaturePad, setSignaturePad] = useState<SignaturePad>();
  const [canvas, setCanvas] = useState<any>();

  //to set the canvas, canvas reference and signaturePad
  useEffect(() => {
    // canvas = canvasRef.current;
    setCanvas(canvasRef.current);
  }, []);

  useEffect(() => {
    if (canvas) {
      setSignaturePad(
        () =>
          new SignaturePad(canvas, {
            minWidth: 0.4,
            maxWidth: 0.4,
          })
      );
    }
  }, [canvas]);

  useEffect(() => {
    setSignatureValue();
  }, [signaturePad]);

  const setSignatureValue = () => {
    let data;
    if (canvas) {
      if (input.length > 0) {
        if (signaturePad) {
          const isPadEmpty = signaturePad.isEmpty();
          const isTextEmpty = input.trim() === "";
          if (isPadEmpty && isTextEmpty) {
            console.log("empty");
          } else {
            data = signaturePad.toDataURL("image/jpg");

            props.saveSignatures && props.saveSignatures(props.field, data);
          }
        }
      } else {
        canvas.addEventListener("touchend", handleSignatureEvent);
        canvas.addEventListener("click", handleSignatureEvent);
      }
    }
  };

  function handleSignatureEvent(event) {
    event.preventDefault(); // Prevent default behavior for both touch and click events
    
    // Your signature handling code here
    if (signaturePad) {
      const isPadEmpty = signaturePad.isEmpty();
      const isTextEmpty = input.trim() === "";
      if (isPadEmpty && isTextEmpty) {
        console.log("empty");
      } else {
        const data = signaturePad.toDataURL("image/jpg");
        props.saveSignatures && props.saveSignatures(props.field, data);
      }
    }
  }

  //clear the canvas
  const clearCanvas = () => {
    signaturePad && signaturePad.clear();
    setInput("");
  };

  useEffect(() => {
    if (input) {
      setSignatureValue();
    }
  }, [input]);

  //handle change in input field
  const handleChange = (event) => {
    setInput(event.target.value);
    // canvas = canvasRef.current;
    const text = event.target.value;
    const context = canvas.getContext("2d");
    const fontSize = 50;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const textWidth = context.measureText(text).width;

    // Calculate the coordinates for centering the text
    const x = (canvasWidth - textWidth) / 2;
    const y = (canvasHeight + fontSize) / 2;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.font = `normal ${fontSize}px Brush Script MT`;
    context.fillText(text, x, y);
  };

  return (
    <Box width='100%'>
      <VStack>
        <Box margin='8px' width='auto'>
          <Center borderWidth={1} borderRadius='4px'>
            <canvas ref={canvasRef} width='400' height='100'></canvas>
          </Center>
          <Input
            placeholder='OR type your name instead...'
            marginTop='4px'
            type='text'
            name='text'
            value={input}
            onChange={(event) => handleChange(event)}
          />
        </Box>
        <Box>
          <Button
            variant='outline'
            marginRight='8px'
            onClick={() => clearCanvas()}
          >
            Clear
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}

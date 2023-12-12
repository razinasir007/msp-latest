import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { Slider, TextField } from '@mui/material';
import { Col, Row } from 'react-bootstrap';
import { useHookstate } from '@hookstate/core';
import { globalState } from '../state/store';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "400px",
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export function BasicModal() {
  const [open, setOpen] = React.useState(false);

  const state = useHookstate(globalState);
  
  const sliderValue = state.productSelection.sliderValue;
  const inchesLength = state.productSelection.inchesLength;


  const pixelLength = 150
  const currentLength = pixelLength + (sliderValue.get() / 100) * pixelLength;
  const pixelRatio = currentLength / inchesLength.get();
  
  const handleOpen = () => setOpen(true);


  function handleClose(){
    state.productSelection.pixelRatio.set(pixelRatio)
    setOpen(false)
  }

  return (
    <div>
      <Button variant="outlined" style={{maxHeight: 25}} onClick={handleOpen}>Calibrate</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
            <Row>
                <Col>
                <TextField
                    style={{ width: 300 }}
                    label="How long is the black line in Inches?"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    defaultValue={inchesLength.get()}
                    onChange={(event) => {
                    const updatedValue = parseFloat(event.target.value);
                    if (updatedValue) {
                      inchesLength.set(updatedValue)
                    }
                    }}
                />
                </Col>
            </Row>

            <Row>
                <Col>
                    <p className="mb-3">Reference Line: {currentLength} px (<i>{(pixelRatio).toFixed(2)} pixels/inch</i>)</p>
                    <div className="mb-2" style={{ width: currentLength, height: 5, backgroundColor: "black" }} />
                </Col>
            </Row>

            <Row>
                <Col>
                    <Slider
                        style={{ width: 150 }}
                        defaultValue={sliderValue.get()}
                        aria-label="Default"
                        valueLabelDisplay="auto"
                        onChange={(event, value, activeThumb) => {
                          sliderValue.set(value as number)
                        }}
                    />
                </Col>
            </Row>

        </Box>
      </Modal>
    </div>
  );
}

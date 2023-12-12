import { Paper } from "@mui/material";
import { Container } from "@mui/system";
import React from "react";
import { Row } from "react-bootstrap";
import Checkout from "../../../checkout";
import { Gallery } from "../../../gallery";
import { PresentationView } from "../../../presentation";
import { Tabcontainer } from "../../../productselection";
import HorizontalLinearStepper from "./stepper";
import { Uploader } from "../../../uploader/uploader";

const steps = [
  {
    label: "Upload your Images",
    view: <Uploader />,
    action: () => console.log("uploaded"),
  },
  {
    label: "Select Your Images",
    view: <Gallery />,
    action: () => console.log("selected"),
  },
  {
    label: "Presentation",
    view: <PresentationView />,
    action: () => console.log("selected"),
  },
  {
    label: "Product Selection",
    view: <Tabcontainer />,
    action: () => console.log("chosen"),
  },
  {
    label: "Checkout",
    view: <Checkout />,
    action: () => console.log("checked out"),
  },
];

export const ToolView = () => {
  return (
    <Container className=''>
      <Row className=''>
        <Paper elevation={3} className='p-4 me-4 mt-4'>
          <HorizontalLinearStepper steps={steps} />
        </Paper>
      </Row>
    </Container>
  );
};

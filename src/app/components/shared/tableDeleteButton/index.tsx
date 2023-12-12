import React, { useState } from "react";

import { Center } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { ICellRendererParams } from "ag-grid-community";

interface CustomProps extends ICellRendererParams {
  onDelete?;
}

export function TableDeleteButton(props: CustomProps) {
  const id = props.data.id;
  const [loading, setLoading] = useState(false);

  const buttonClicked = () => {
    setLoading(true); // Set loading to true when button is clicked
    props.onDelete(id);
  };

  return (
    <Center height={"100%"}>
      <IconButton
        isLoading={loading}
        variant='ghost'
        aria-label='Delete from grid'
        sx={{
          ":hover": {
            backgroundColor: "transparent",
          },
        }}
        icon={<DeleteIcon fontSize='18px' />}
        onClick={buttonClicked}
      />
    </Center>
  );
}

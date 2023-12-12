import React, { useEffect, useState } from "react";
import { useHookstate } from "@hookstate/core";
import { Grid, GridItem } from "@chakra-ui/react";
import { GalleryView } from "./galleryView";
import { ImageCropper } from "./cropper";
import { SelectedTable } from "./selectedTable";
import { UploadedPhoto } from "../../../state/interfaces";

export function Gallery() {
  const editedImage = useHookstate<UploadedPhoto>({
    id: "",
    filename: "",
    base64: "",
    size: 0,
    type: "",
  });
  const [editPhoto, setEditPhoto] = useState(false);

  return (
    <Grid
      className='mt-4'
      h='100%'
      templateColumns='repeat(3, 1fr)'
      overflow='hidden'
    >
      <GridItem
        className='hide-scrollbar'
        colSpan={2}
        bg='#F7F5F0'
        style={{ padding: "20px" }}
      >
        {editPhoto ? (
          <ImageCropper setEditPhoto={setEditPhoto} image={editedImage.get()} />
        ) : (
          <GalleryView />
        )}
      </GridItem>
      <GridItem
        className='hide-scrollbar'
        bg='#EAE8E3'
        colSpan={1}
        style={{ padding: "20px" }}
      >
        <SelectedTable setEditPhoto={setEditPhoto} editedImage={editedImage} />
      </GridItem>
    </Grid>
  );
}

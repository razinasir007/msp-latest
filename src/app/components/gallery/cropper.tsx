import React, { useState } from "react";
import { useGlobalState } from "../../../state/store";
import Cropper from "react-cropper";
import { v4 as uuidv4 } from "uuid";
import "cropperjs/dist/cropper.css";
import "./styles.scss";
import {
  Button,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Spacer,
  VStack,
  Text,
  HStack,
  Image,
} from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { UploadPhoto } from "../../../apollo/orderQueries";
import { dataURLtoFile } from "../../../constants";
import { useFirebaseAuth } from "../../auth";
import { UploadedPhoto } from "../../../state/interfaces";

const blankImage =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export function ImageCropper(props: { setEditPhoto; image: UploadedPhoto }) {
  const state = useGlobalState();
  const { user } = useFirebaseAuth();
  const [cropData, setCropData] = useState(blankImage);
  const [cropper, setCropper] = useState<any>();
  const [
    EditPhoto,
    {
      loading: EditedPhotoLoading,
      error: EditedPhotoError,
      data: EditedPhotoData,
    },
  ] = useMutation(UploadPhoto, {});

  const getCropData = () => {
    if (typeof cropper !== "undefined") {
      const croppedImage = cropper.getCroppedCanvas().toDataURL();
      setCropData(croppedImage);
    }
  };

  //Usage example:

  function save() {
    const updated: UploadedPhoto = {
      ...props.image,
      base64: cropData,
    };
    state.updateImage(props.image, updated);
    props.setEditPhoto(false);
    var file = dataURLtoFile(cropData, updated.name);
    const ImagePath = updated?.path?.substring(
      1,
      updated?.path?.lastIndexOf("/")
    );
    const formattedPayload = {
      id: uuidv4(),
      userId: user?.uid,
      // appointmentId: "001",
      name: updated.name,
      virtualPath: ImagePath?.length !== 1 ? ImagePath : "",
      type: file?.type.split("/")[1],
      size: file?.size,
      stage: "EDITED",
      isFavourite: false,
      file: file,
      originalId: updated.id,
    };
    EditPhoto({
      variables: {
        createdBy: user?.uid,
        photo: formattedPayload,
      },
    });
  }
  return (
    <>
      <Flex>
        <Text fontSize='lg' as='b'>
          Edit
        </Text>
        <Spacer />

        <HStack spacing='14px'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              props.setEditPhoto(false);
            }}
          >
            Exit
          </Button>
          <Button size='sm' variant='outline' onClick={getCropData}>
            Crop
          </Button>
          <Button size='sm' variant='solid' onClick={save}>
            Save
          </Button>
        </HStack>
      </Flex>
      <Grid paddingTop='12px' templateColumns='repeat(2, 1fr)' gap={4}>
        <GridItem>
          <VStack spacing='10px'>
            <Cropper
              style={{ height: 400, width: "100%" }}
              initialAspectRatio={1}
              src={props.image.base64}
              viewMode={1}
              minCropBoxHeight={100}
              minCropBoxWidth={100}
              background={false}
              responsive={true}
              checkOrientation={false}
              onInitialized={(instance) => {
                setCropper(instance);
              }}
              cropmove={(e) => getCropData()}
              guides={true}
            />
            <Spacer />
            <Heading as='h5' size='md'>
              Original
            </Heading>
          </VStack>
        </GridItem>
        <GridItem>
          <VStack spacing='10px'>
            <Box className='cropped-image-container'>
              <Flex alignItems='center' justifyContent='center' h='100%'>
                <Image src={cropData} alt='cropped' />
              </Flex>
            </Box>
            <Heading as='h5' size='md'>
              Cropped
            </Heading>
          </VStack>
        </GridItem>
      </Grid>
    </>
  );
}

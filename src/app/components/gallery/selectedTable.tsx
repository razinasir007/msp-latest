import React from "react";
import { useGlobalState } from "../../../state/store";
import { State } from "@hookstate/core";
import {
  Text,
  Box,
  Flex,
  Center,
  VStack,
  Spacer,
  Image,
  Button,
} from "@chakra-ui/react";
import { AiFillFolder } from "react-icons/ai";
import { UploadedPhoto } from "../../../state/interfaces";

export function SelectedTable(props: {
  setEditPhoto;
  editedImage: State<UploadedPhoto>;
}) {
  const state = useGlobalState();
  const selectedImages = state.getSelectedImages();

  return (
    <>
      <Flex>
        <VStack spacing='0'>
          <Text fontSize='lg' as='b'>
            Selected Files : {selectedImages.length}
          </Text>
          <Text fontSize='xs' as='i'>
            Click on an image to crop it
          </Text>
        </VStack>
        <Spacer />
        {selectedImages.length === 0 ? (
          <></>
        ) : (
          <Button
            variant='mspCustom'
            onClick={() => {
              state.setSelectAll(false);
              state.setSelectedImages([]);
            }}
            size='sm'
          >
            Deselect All
          </Button>
        )}
      </Flex>

      {selectedImages.length === 0 ? (
        <Center height={"80%"}>
          <VStack spacing={"0"}>
            <AiFillFolder size={"40px"} />
            <Text fontSize='lg' as='b'>
              There are no files currently selected.
            </Text>
          </VStack>
        </Center>
      ) : (
        <Box paddingTop='12px'>
          <VStack spacing='16px'>
            {selectedImages && selectedImages.map((image) => (
              <Image
                key={image.id}
                bg='white'
                width='100%'
                maxHeight='134px'
                objectFit='contain'
                src={image.base64}
                onClick={() => {
                  props.editedImage.set({ ...image });
                  props.setEditPhoto(true);
                }}
              />
            ))}
          </VStack>
        </Box>
      )}
    </>
  );
}

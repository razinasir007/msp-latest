import React from "react";
import { UploadedAudio, useGlobalState } from "../../../../../state/store";
import { Text, IconButton, Flex, Spacer } from "@chakra-ui/react";
import { TiDelete } from "react-icons/ti";

export const UploadedAudioCards = (props: { audioFile: UploadedAudio}) => {
  const state = useGlobalState();
  
  function removeAudio(audio: UploadedAudio) {
    state.removeAudio(audio);
    state.setSelectedAudio([]);
    state.setSelectAllAudios(false);
  }

  return (
    <Flex bg='#F7F5F0' p='8px' width={"100%"} borderRadius='4px'>
      <Flex direction={"column"}>
        <Text>
          <Text as={"b"}>Name:</Text> {props.audioFile.filename}
          <Text as={"b"}>/ Type:</Text> {props.audioFile.type}
        </Text>
        <Text>
          <Text as={"b"}>Size: </Text>
          {props.audioFile.size} bytes
        </Text>
      </Flex>
      <Spacer />
      <IconButton
        variant='ghost'
        aria-label='Remove uploaded image'
        sx={{
          ":hover": {
            backgroundColor: "#EAE8E9",
          },
        }}
        icon={<TiDelete size={"25px"} />}
        onClick={() => removeAudio(props.audioFile)}
      />
    </Flex>
  );
}

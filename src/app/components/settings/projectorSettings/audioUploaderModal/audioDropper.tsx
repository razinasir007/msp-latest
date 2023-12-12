import React from "react";
import { v4 as uuidv4 } from "uuid";
import { Center, Text } from "@chakra-ui/react";
import { RiFolderUploadFill } from "react-icons/ri";
import { useGlobalState } from "../../../../../state/store";
/**
 * https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#process_the_drop
 */
export function AudioDropper() {
  const state = useGlobalState();

  // function appendAudios(newAudio: UploadedAudio[]) {
  function appendAudios(newAudio) {
    state.addAudios([...newAudio]);
  }
  // https://stackoverflow.com/a/57272491
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  function dropHandler(ev) {
    let files: File[] = [];
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    // Use DataTransferItemList interface to access the file(s)
    if (ev.dataTransfer.items) {
      [...ev.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file: File = item.getAsFile();
          files.push(file);
        }
      });
    }
    // Use DataTransfer interface to access the file(s)
    else {
      [...ev.dataTransfer.files].forEach((file, i) => {
        files.push(file);
      });
    }
    // convert File objects to an UploadedPhoto type
    Promise.all(
      files.map((file) =>
        toBase64(file).then((str) => {
          const converted = {
            id: uuidv4(),
            filename: file.name,
            base64: str as string,
            size: file.size,
            type: file.type,
          };
          return converted;
        })
      )
    ).then((files) => appendAudios(files));
  }

  function dragOverHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  return (
    <Center
      minH='400px'
      flexDirection='column'
      onDrop={dropHandler}
      onDragOver={dragOverHandler}
      borderRadius='4px'
      border={"1px dashed #8A8A8A"}
    >
      <RiFolderUploadFill size={"40px"} />
      <Text fontSize='md'>
        <Text as='b'>Upload</Text> a file or drag and drop
      </Text>
      <Text fontSize='xs'>MP3 Files </Text>
    </Center>
  );
}

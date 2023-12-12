import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Center } from "@chakra-ui/react";
import { useGlobalState } from "../../../../state/store";
import { UploadedBase64 } from "../../../../state/interfaces";
import { parse } from "id3-parser";

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#process_the_drop
 */
export function Dropper(props: {
  fileState?;
  setFilesLen?;
  setFile?;
  height?;
  width?;
  children?;
}) {
  const state = useGlobalState();
  function appendFiles(newFiles: UploadedBase64[]) {
    props.fileState && props.fileState([...newFiles]);
  }
  //new code with thumbnail
  interface Base64WithThumbnailResult {
    base64: string;
    thumbnail: string;
  }
  const toBase64WithThumbnail = (
    file: File
  ): Promise<Base64WithThumbnailResult> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      const thumbnailReader = new FileReader();
      let base64;
      reader.onload = () => {
        base64 = reader.result as string;
        thumbnailReader.readAsArrayBuffer(file);
      };
      thumbnailReader.onload = () => {
        const tags = parse(
          new Uint8Array(thumbnailReader.result as ArrayBuffer)
        );
        const thumbnailBase64 = arrayBufferToBase64(tags.image?.data);
        resolve({
          base64,
          thumbnail: thumbnailBase64,
        });
      };
      reader.onerror = (error) => reject(error);
      thumbnailReader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };
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
    props.setFilesLen && props.setFilesLen(files.length);
    props.setFile && props.setFile(files[0]);
    //new code with thumbnail
    Promise.all(
      files.map((file) =>
        toBase64WithThumbnail(file).then((result) => {
          const base64String: string = result.base64;
          const thumbnailString: string = result.thumbnail;
          const converted: UploadedBase64 = {
            id: uuidv4(),
            filename: file.name,
            isSelected: false,
            base64: base64String as string,
            size: file.size,
            type: file.type,
            thumbnail: thumbnailString,
            imageFile: file,
          };
          return converted;
        })
      )
    ).then((files) => appendFiles(files));
  }

  function dragOverHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  return (
    <Center
      height={props.height}
      width={props.width}
      flexDirection='column'
      onDrop={dropHandler}
      onDragOver={dragOverHandler}
      borderRadius='4px'
      border={"1px dashed #8A8A8A"}
    >
      {props.children}
    </Center>
  );
}

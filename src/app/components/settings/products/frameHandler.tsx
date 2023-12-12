import React, { useEffect, useState } from "react";

import {
  IconButton,
  Image,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
  Button,
} from "@chakra-ui/react";
import { AiOutlineUpload } from "react-icons/ai";
import { RiFolderUploadFill } from "react-icons/ri";
import { Dropper } from "../../shared/dropper";
import { UploadedBase64 } from "../../../../state/interfaces";

export const FrameHandler = (props: { imageData?; optionsState?; option? }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [file, setFile] = useState<Array<UploadedBase64>>([]);
  const { optionsState, option } = props;

  //return a promise that resolves with a File instance
  // function urltoFile(url, filename, mimeType) {
  //   return fetch(url)
  //     .then(function (res) {
  //       return res.arrayBuffer();
  //     })
  //     .then(function (buf) {
  //       return new File([buf], filename, { type: mimeType });
  //     });
  // }

  // //Usage example:
  // urltoFile(
  //   `data:image/png;base64,${props.imageData.image}`,
  //   `${props.imageData.value}.png`,
  //   "image/png"
  // ).then(function (file) {
  //   console.log("THIS IS CONVERTED FILE", file);
  // });

  if (file.length > 0) {
    const imageBase64 = file[0].base64.split(",")[1];
    optionsState.set((oriState) => {
      oriState.map((defOps) => {
        if (defOps.id === option.id) {
          defOps.fields[props.imageData.sortingIndex].image = {
            file: file[0].imageFile,
            base: imageBase64,
          };
        }
      });
      return oriState;
    });
    setFile([]);
  }

  return props.imageData.image ? (
    <Popover trigger='hover'>
      <PopoverTrigger>
        <Image
          boxSize='25px'
          objectFit='contain'
          src={`data:image/png;base64,${props.imageData.image.base}`}
        />
      </PopoverTrigger>
      <PopoverContent border='none' bg='greys.400'>
        <PopoverArrow bg='greys.400' />
        <Image
          objectFit='contain'
          src={`data:image/png;base64,${props.imageData.image.base}`}
        />
      </PopoverContent>
    </Popover>
  ) : (
    <>
      <IconButton
        boxShadow='0px 0px 4px 0px rgba(0, 0, 0, 0.45)'
        size='xs'
        aria-label='Upload frame image'
        icon={<AiOutlineUpload />}
        onClick={onOpen}
      />
      <Modal
        size='lg'
        isOpen={isOpen && file.length === 0}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius='4px'>
          <ModalHeader
            fontSize='h5'
            lineHeight='28px'
            padding='16px'
            borderBottom='1px'
            borderColor=' greys.300'
            textAlign='center'
          >
            Upload Frame Photo
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody padding='16px'>
            <Dropper height='200px' fileState={setFile}>
              <RiFolderUploadFill size={"40px"} />
              <Text fontSize='md'>
                <Text as='b'>Drag and drop</Text> a frame image
              </Text>
            </Dropper>
          </ModalBody>

          <ModalFooter
            padding='10px 16px'
            borderTop='1px'
            borderColor=' greys.300'
          >
            <Button size='sm' variant='outline' mr={2} onClick={onClose}>
              Cancel
            </Button>
            <Button size='sm'>Upload</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

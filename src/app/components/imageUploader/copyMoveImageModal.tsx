import React from "react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Flex,
  Text,
} from "@chakra-ui/react";
import UploadedCard from "./uploadedCard";
import { globalState, useGlobalState } from "../../../state/store";
import { useHookstate } from "@hookstate/core";
import { v4 as uuidv4 } from "uuid";
import { useMutation } from "@apollo/client";
import { UploadPhoto } from "../../../apollo/orderQueries";
import { StageEnum } from "../../../constants/enums";

export const CopyMoveImageModal = (props: {
  folders?;
  clickedImage;
  setClicked;
  currentFolder?;
  isCopy?;
}) => {
  const { folders, clickedImage, setClicked, currentFolder, isCopy } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const state = useGlobalState();
  const wrappedState = useHookstate(globalState);
  const orderId = localStorage.getItem("OrderId");
  const uploadedImages = state.getImages();
  const [uploadPhoto, uploadPhotoResponse] = useMutation(UploadPhoto);
  const stateUser = useHookstate(globalState.user);

  const handleMoveClick = (e) => {
    e.stopPropagation();
    onOpen();
  };
  const handleFolderClick = (folder, foldername) => {
    setClicked(false);
    if (!folder) {
      return;
    }
    if (!isCopy) {
      uploadedImages.map((image) => {
        if (image.id === clickedImage.id) {
          let newPath;
          // Check if the image is currently in a folder
          const folderInPath = image.path.indexOf("/") !== -1;

          if (folderInPath) {
            const parts = image.path.split("/");
            const existingFolderPath = parts.slice(0, -1).join("/"); // Remove the file name from the existing path
            newPath = `${existingFolderPath}/${foldername}/${
              parts[parts.length - 1]
            }`;
          } else {
            newPath = `/${foldername}/${image.path}`;
          }
          const updatedImage = {
            ...image,
            path: newPath,
          };

          state.updateImage(image, updatedImage);
          switch (foldername) {
            case "Originals":
              state.addOriImages([image]);
              break;
            case "Presentation":
              state.addPresentationImages([updatedImage]);
              break;
            default:
              break;
          }
        }
      });
    } else {
      uploadedImages.map((image) => {
        if (image.id === clickedImage.id) {
          let newPath;
          // Check if the image is currently in a folder
          const folderInPath = image.path.indexOf("/") !== -1;

          if (folderInPath) {
            const parts = image.path.split("/");
            const existingFolderPath = parts.slice(0, -1).join("/"); // Remove the file name from the existing path
            newPath = `${existingFolderPath}/${foldername}/${
              parts[parts.length - 1]
            }`;
          } else {
            newPath = `/${foldername}/${image.path}`;
          }
          const updatedImage = {
            ...image,
            id: uuidv4(),
            path: newPath,
          };
          let payload = {
            id: updatedImage.id,
            userId: stateUser.value?.uid,
            orderId: orderId,
            name: updatedImage?.file?.name,
            virtualPath: updatedImage.path,
            type: updatedImage?.file?.type.split("/")[1],
            size: image?.file?.size,
            stage: StageEnum.ORIGINAL,
            isFavourite: false,
            file: updatedImage.file,
          };
          uploadPhoto({
            variables: {
              createdBy: stateUser.value?.uid,
              photo: payload,
            },
          });
          wrappedState.uploadedImages.set((previousImage) => {
            return [...previousImage, updatedImage];
          });
          switch (foldername) {
            case "Originals":
              state.addOriImages([image]);
              break;
            case "Presentation":
              state.addPresentationImages([updatedImage]);
              // });
              break;
            default:
              break;
          }
        }
      });
    }
  };
  return (
    <>
      <Text w='100%' onClick={handleMoveClick}>
        {isCopy ? "Copy" : "Move"}
      </Text>

      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={() => {
          onClose(), setClicked(false);
        }}
        size='md'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isCopy ? "Copy Image To" : "Move Image To"}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {folders !== null && folders !== undefined
              ? Object.keys(folders)
                  .filter((folderName) => folderName !== "root")
                  .map((folderName, index) => {
                    return (
                      <Flex key={index} width={"100%"}>
                        <Flex
                          width={"100%"}
                          onClick={() =>
                            handleFolderClick(folders[folderName], folderName)
                          }
                        >
                          <UploadedCard
                            showButtons={false}
                            label={folderName}
                          />
                        </Flex>
                      </Flex>
                    );
                  })
              : Object.keys(currentFolder)
                  .filter((folderName) => folderName !== "images")
                  .map((folderName, index) => {
                    return (
                      <Flex
                        key={index}
                        width={"100%"}
                        onClick={() =>
                          handleFolderClick(
                            currentFolder[folderName],
                            folderName
                          )
                        }
                      >
                        <UploadedCard
                          showButtons={false}
                          label={folderName}
                          key={index}
                        />
                      </Flex>
                    );
                  })}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

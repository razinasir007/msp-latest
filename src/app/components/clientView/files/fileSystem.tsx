import React, { useEffect, useRef, useState } from "react";
import { useGlobalState } from "../../../../state/store";
import {
  Box,
  Flex,
  Center,
  VStack,
  useDisclosure,
  SkeletonText,
} from "@chakra-ui/react";
import UploadedCard from "../../imageUploader/uploadedCard";
import { UploadedPhoto } from "../../../../state/interfaces";
import { extractImagesByFolders } from "../../../../constants";
import ImagePreviewModal from "../../imageUploader/imagePreviewModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useQuery } from "@apollo/client";
import { GetPhotosByOrderId } from "../../../../apollo/orderQueries";

export const FileSystem = (props: {
  breadCrumb?;
  setBreadCrumb?;
  currentFolder?;
  setCurrentFolder?;
  folderStack?;
  setFolderStack?;
  folders?;
  setFolders?;
  orderId;
}) => {
  const {
    breadCrumb,
    setBreadCrumb,
    currentFolder,
    setCurrentFolder,
    folderStack,
    setFolderStack,
    folders,
    setFolders,
    orderId,
  } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const state = useGlobalState();
  const clientUploadedImages = state.getClientImages();
  const [localCurrentFolder, setLocalCurrentFolder] = useState("");
  const [clientImages, setClientImages] = useState([]);
  const [imageToPreview, setImageToPreview] = useState({
    name: "",
    base64: "",
  });
  const {
    loading: PhotoLoading,
    error: PhotoError,
    data: PhotoData,
  } = useQuery(GetPhotosByOrderId, {
    variables: { orderId: orderId },
  });
  function handleFolderClick(folder, folderName) {
    setLocalCurrentFolder(folderName);
    setBreadCrumb((prevStack) => [...prevStack, folderName]);
    setFolderStack((prevStack) => [...prevStack, currentFolder]);
    setCurrentFolder(folder);
  }
  function handleImagePreview(image) {
    setImageToPreview({
      name: image.name,
      base64: image.resizedBase64,
    });
    onOpen();
  }
  useEffect(() => {
    let value = folders;
    for (const part of breadCrumb) {
      if (value && value[part]) {
        value = value[part];
      } else {
        // Handle the case where the breadcrumb doesn't match the nested structure
        value = null;
        break;
      }
    }
    if (folderStack.length !== 0 && localCurrentFolder !== "")
      setCurrentFolder(value);
    else if (folderStack.length === 0) setCurrentFolder([]);
  }, [folders]);

  useEffect(() => {
    if (PhotoData) {
      if (PhotoData && PhotoData.photos && PhotoData.photos.lookupByOrder) {
        const fetchedImages = PhotoData.photos.lookupByOrder;

        if (fetchedImages.length > 0) {
          // Step 4: Append fetched images to uploadedImages
          const newUploadedImages = [];

          fetchedImages.forEach((image) => {
            const imageObj = {
              base64: `data:image/png;base64,${image.resizedContent}`,
              id: image.id,
              path:
                image.virtualPath === ""
                  ? `${image.name}`
                  : `/${image.virtualPath}/${image.name}`,
              resizedBase64: `data:image/png;base64,${image.resizedContent}`,
              thumbnailBase64: `data:image/png;base64,${image.thumbnailContent}`,
            };

            newUploadedImages.push(imageObj); // Always add to uploadedImages

            // Check if the virtual path is "Presentation"
          });

          // state.addClientImages([...newUploadedImages]);
          // Set the local clientImages state with newUploadedImages
          setClientImages((prevImages) => [
            ...prevImages,
            ...newUploadedImages,
          ]);
        }
      }
    }
  }, [PhotoData]);
  const extFolders = extractImagesByFolders(clientImages);
  useEffect(() => {
    let tempFolders = { ...folders, ...extFolders };
    setFolders(tempFolders);
  }, [clientImages]);
  const dragImages = (result) => {
    // dropped outside the list
    // if (!result.destination || result.destination.droppableId === "droppable") {
    //   return;
    // }
    // if (result.type === "DEFAULT") {
    //   clientImages.map((image) => {
    //     if (image.id === result.draggableId) {
    //       const newPath = `/${result.destination.droppableId}/${image.path}`;
    //       const updatedImage = {
    //         ...image,
    //         path: newPath,
    //       };
    //       state.updateClientViewImage(image, updatedImage);
    //     }
    //   });
    // }
  };
  return (
    <>
      {PhotoLoading ? (
        <Box
          padding='6'
          // boxShadow='lg'
          // bg='greys.400'
          width='100%'
          minH='435px'
          maxH='435px'
          mt='20px'
          borderRadius='4px'
        >
          <SkeletonText mt='4' noOfLines={7} spacing='5' skeletonHeight='10' />
        </Box>
      ) : (
        <>
          <ImagePreviewModal
            image={imageToPreview}
            isOpen={isOpen} // Pass isOpen from useDisclosure to control modal visibility
            onClose={() => {
              onClose(), setImageToPreview({ base64: "", name: "" });
            }} // Pass onClose from useDisclosure to close the modal
          />
          <Center
            height={"100%"}
            flexDirection={"column"}
            justifyContent={"flex-start"}
          >
            {currentFolder && currentFolder.length === 0 ? (
              <>
                <DragDropContext onDragEnd={dragImages}>
                  <Droppable droppableId='droppable'>
                    {(provided, snapshot) => (
                      <>
                        <Flex
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          key={"index"}
                          width={"100%"}
                          height={"100%"}
                        >
                          <VStack
                            spacing={"8px"}
                            width={"100%"}
                            height={"100%"}
                          >
                            <>
                              {Object.keys(folders)
                                .filter((folderName) => folderName !== "root")
                                .map((folderName, index) => {
                                  return (
                                    <Droppable
                                      droppableId={folderName}
                                      key={index}
                                    >
                                      {(provided, snapshot) => (
                                        <>
                                          <Flex
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            key={index}
                                            width={"100%"}
                                            bg={
                                              snapshot.isDraggingOver
                                                ? "greys.600"
                                                : ""
                                            }
                                            borderRadius={
                                              snapshot.isDraggingOver
                                                ? "4px"
                                                : ""
                                            }
                                          >
                                            <Flex width={"100%"}>
                                              <UploadedCard
                                                showButtons={false}
                                                label={folderName}
                                                folderClick={() =>
                                                  handleFolderClick(
                                                    folders[folderName],
                                                    folderName
                                                  )
                                                }
                                              />
                                            </Flex>
                                          </Flex>
                                          <Flex style={{ display: "none" }}>
                                            {provided.placeholder}
                                          </Flex>
                                        </>
                                      )}
                                    </Droppable>
                                  );
                                })}

                              {folders.root &&
                                folders.root.images.length !== 0 &&
                                folders.root.images.map(
                                  (image: UploadedPhoto, index) => (
                                    <Draggable
                                      key={index}
                                      draggableId={image.id}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <Flex
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            ...provided.draggableProps.style,
                                            boxShadow: snapshot.isDragging
                                              ? "0 0 .4rem #666"
                                              : "none",
                                            background: snapshot.isDragging
                                              ? "rgba(218, 223, 225, 0.75)"
                                              : "none",
                                            width: snapshot.isDragging
                                              ? "50%"
                                              : "100%",
                                          }}
                                        >
                                          <UploadedCard
                                            showButtons={false}
                                            label={image.name}
                                            thumbnail={image.thumbnailBase64}
                                            key={image.id}
                                            size={image?.file?.size}
                                            type={image?.file?.type}
                                            path={image.path}
                                            folderClick={() => {
                                              handleImagePreview(image);
                                            }}
                                          />
                                        </Flex>
                                      )}
                                    </Draggable>
                                  )
                                )}
                            </>
                          </VStack>
                        </Flex>
                        {provided.placeholder}
                      </>
                    )}
                  </Droppable>
                </DragDropContext>
              </>
            ) : (
              <VStack spacing={"8px"} width={"100%"} height={"100%"}>
                <>
                  {currentFolder &&
                    Object.keys(currentFolder)
                      .filter((folderName) => folderName !== "images")
                      .map((folderName, index) => {
                        return (
                          <Flex key={index} width={"100%"}>
                            <UploadedCard
                              showButtons={false}
                              label={folderName}
                              key={index}
                              folderClick={() =>
                                handleFolderClick(
                                  currentFolder[folderName],
                                  folderName
                                )
                              }
                            />
                          </Flex>
                        );
                      })}

                  {currentFolder?.images &&
                    currentFolder?.images?.length >= 0 &&
                    currentFolder.images.map((image: UploadedPhoto) => (
                      <UploadedCard
                        showButtons={false}
                        label={image.name}
                        deleteImage={() => state.removeImage(image)}
                        thumbnail={image.thumbnailBase64}
                        key={image.id}
                        size={image?.file?.size}
                        type={image?.file?.type}
                        path={image.path}
                        folderClick={() => handleImagePreview(image)}
                      />
                    ))}
                </>
              </VStack>
            )}
          </Center>
        </>
      )}
    </>
  );
};

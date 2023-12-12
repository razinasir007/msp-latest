import React, { useEffect, useState } from "react";
import { globalState, useGlobalState } from "../../../state/store";
import {
  Text,
  Box,
  Flex,
  Center,
  VStack,
  useDisclosure,
  SkeletonText,
} from "@chakra-ui/react";
import { FaFileUpload } from "react-icons/fa";
import UploadedCard from "./uploadedCard";
import { UploadedPhoto } from "../../../state/interfaces";
import { extractImagesByFolders } from "../../../constants";
import { useHookstate } from "@hookstate/core";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import ImagePreviewModal from "./imagePreviewModal";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GetPhotosByOrderId,
  GetResizedAndThumbnailImage,
  UploadPhoto,
} from "../../../apollo/orderQueries";
import { CreateFolder } from "./createFolder";
import { useContextMenu } from "./useContextMenu";
import { ContextMenu } from "./optionsStyles";
import { CopyMoveImageModal } from "./copyMoveImageModal";
import { StageEnum } from "../../../constants/enums";

export default function UploadedTable(props: {
  breadCrumb?;
  setBreadCrumb?;
  currentFolder?;
  setCurrentFolder?;
  folderStack?;
  setFolderStack?;
  folders?;
  setFolders?;
  searchItem;
  foldername;
  setFolderName;
  handleAddFolder;
  nestedFoldername;
  setNestedFolderName;
  handleAddNestedFolder;
}) {
  const {
    breadCrumb,
    setBreadCrumb,
    currentFolder,
    setCurrentFolder,
    folderStack,
    setFolderStack,
    folders,
    setFolders,
    searchItem,
    foldername,
    setFolderName,
    handleAddFolder,
    nestedFoldername,
    setNestedFolderName,
    handleAddNestedFolder,
  } = props;
  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [clickedImage, setClickedImage] = useState(null);
  const orderId = localStorage.getItem("OrderId");
  const draftOrderItem = localStorage.getItem("DraftOrder");
  const draftOrder = JSON.parse(draftOrderItem);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const upImages = useHookstate(globalState.uploadedImages);
  const stateUser = useHookstate(globalState.user);
  const state = useGlobalState();
  const wrappedState = useHookstate(globalState);
  const uploadedImages = state.getImages();
  const resizedCacheImages = state.getResizedImages();
  const [localCurrentFolder, setLocalCurrentFolder] = useState("");
  const [droppedFolder, setDroppedFolder] = useState("");
  const [imageToPreview, setImageToPreview] = useState({
    name: "",
    base64: "",
  });

  const [getThumbnailandResizedImage, getThumbnailandResizedImageResponse] =
    useLazyQuery(GetResizedAndThumbnailImage);

  const [
    GetPhotos,
    { data: PhotoData, loading: PhotoLoading, error: PhotoError },
  ] = useLazyQuery(GetPhotosByOrderId);

  const handleRemoveImage = (image) => {
    state.removeImage(image);
  };
  useEffect(() => {
    if (draftOrder && draftOrder.order) {
      GetPhotos({
        variables: {
          orderId: draftOrder.order.id,
        },
      }).then(({ data }) => {
        if (data && data.photos && data.photos.lookupByOrder) {
          const fetchedImages = data.photos.lookupByOrder;

          if (fetchedImages.length > 0) {
            // Step 4: Append fetched images to uploadedImages
            const newUploadedImages = [];
            const newPresentationImages = [];

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
              if (image.virtualPath === "Presentation") {
                newPresentationImages.push(imageObj);
              }
            });

            state.addImages([...newUploadedImages]);

            if (newPresentationImages.length > 0) {
              state.addPresentationImages([...newPresentationImages]);
            }
          }
        }
      });
    }
  }, []);

  function handleImagePreview(image) {
    const cachedImage = resizedCacheImages.find(
      (cached) => cached.id === image.id
    );
    if (cachedImage) {
      setImageToPreview({
        name: cachedImage.name,
        base64: cachedImage.base64,
      });
      onOpen();
      return;
    }

    getThumbnailandResizedImage({
      variables: { id: image.id, photoType: StageEnum.RESIZED },
    })
      .then(({ data }) => {
        const isImageAlreadyAdded = resizedCacheImages.some(
          (cached) => cached.id === image.id
        );
        if (
          data.photos.lookup.content !== "" &&
          data.photos.lookup.content !== null
        )
          if (!isImageAlreadyAdded) {
            // Check if an image with the same id already exists in the state

            state.addResizedImages([
              {
                id: image.id,
                name: image.name,
                base64: `data:image/png;base64,${data.photos.lookup.content}`,
              },
            ]);
          }
        //update the images state
        wrappedState.uploadedImages.set((prevImages) => {
          const updatedImages = prevImages.map((prevImage) =>
            prevImage.id === image.id
              ? {
                  ...prevImage,
                  resizedBase64: `data:image/png;base64,${data.photos.lookup.content}`,
                  uploaded: true,
                }
              : prevImage
          );
          return updatedImages;
        });
        setImageToPreview({
          name: image.name,
          base64: `data:image/png;base64,${data.photos.lookup.content}`,
        });
      })
      .catch((err) => {
        console.log("Error fetching resized image:", err);
      });

    onOpen();
  }

  const extFolders = extractImagesByFolders(uploadedImages);

  useEffect(() => {
    let tempFolders = { ...folders, ...extFolders };
    setFolders(tempFolders);
  }, [upImages]);

  function handleFolderClick(folder, folderName) {
    setLocalCurrentFolder(folderName);
    setBreadCrumb((prevStack) => [...prevStack, folderName]);
    setFolderStack((prevStack) => [...prevStack, currentFolder]);
    setCurrentFolder(folder);
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

  const [uploadPhoto, uploadPhotoResponse] = useMutation(UploadPhoto);

  async function appendImages(newImages: UploadedPhoto[]) {
    let image = newImages[0];

    // checks if the path does not have any folder then set virtual path to ""
    let ImagePath = "";
    if (image.path && image.path.search("/") !== -1) {
      ImagePath = image.path.substring(1, image?.path?.lastIndexOf("/"));
    }

    let payload = {
      id: image.id,
      userId: stateUser.value?.uid,
      orderId: orderId,
      name: image?.file?.name,
      virtualPath: ImagePath,
      type: image?.file?.type.split("/")[1],
      size: image?.file?.size,
      stage: StageEnum.ORIGINAL,
      isFavourite: false,
      file: image.file,
    };

    state.addImages([{ ...image, thumbnailBase64: "", resizedBase64: "" }]);

    uploadPhoto({
      variables: {
        createdBy: stateUser.value?.uid,
        photo: payload,
      },
    })
      .then(({ data }) => {
        if (data.photos.create) {
          getThumbnailandResizedImage({
            variables: { id: payload.id, photoType: StageEnum.THUMBNAIL },
          })
            .then(({ data }) => {
              if (
                data.photos.lookup.content !== "" &&
                data.photos.lookup.content !== null
              ) {
                let tempImage: UploadedPhoto[] = [
                  {
                    ...image,
                    thumbnailBase64: `data:image/png;base64,${data.photos.lookup.content}`,
                    resizedBase64: "",
                    uploaded: true,
                  },
                ];
                state.updateImage(image, tempImage[0]);
                //update the images state
                wrappedState.presentationImages.set((prevImages) => {
                  const updatedImages = prevImages.map((prevImage) =>
                    prevImage.id === image.id
                      ? {
                          ...prevImage,
                          thumbnailBase64: `data:image/png;base64,${data.photos.lookup.content}`,
                          uploaded: true,
                        }
                      : prevImage
                  );
                  return updatedImages;
                });
              }
            })
            .catch((err) => {
              console.log("Error fetching resized image:", err);
            });
        }
      })
      .catch((err) => {
        console.log("Error uploading images:", err);
      });

    if (newImages && newImages[0].path.startsWith("/", 0)) {
      const splitPath = newImages[0].path.split("/");

      if (splitPath[1] === "Originals") {
        state.addOriImages([...newImages]);
      } else if (splitPath[1] === "Presentation") {
        state.addPresentationImages([...newImages]);
      }
    }
  }

  const onDropHover = (acceptedFiles, folderName) => {
    setDroppedFolder(folderName);
  };

  const {
    acceptedFiles: rootAcceptedFiles,
    getRootProps: rootGetRootProps,
    getInputProps: rootInputProp,
  } = useDropzone({
    noClick: true,
  });

  const {
    acceptedFiles: folderAcceptedFiles,
    getRootProps: folderGetRootProps,
    getInputProps: folderInputProp,
  } = useDropzone({
    noClick: true,
  });

  const {
    acceptedFiles: hoverFolderAcceptedFiles,
    getRootProps: hoverFolderGetRootProps,
  } = useDropzone({
    noDragEventsBubbling: true,
    noClick: true,
  });

  // Handle the dropped files here for the ROOT directory
  useEffect(() => {
    rootAcceptedFiles.forEach(async (file) => {
      if (file.type.startsWith("image/")) {
        const converted: UploadedPhoto = {
          id: uuidv4(),
          path: file.path,
          file: file,
          uploaded: false,
        };
        await appendImages([converted]);
      } else {
        console.log("Unrecognized file format");
      }
    });
  }, [rootAcceptedFiles]);

  // Handle the dropped files here for A FOLDER directory
  useEffect(() => {
    const relativePath = breadCrumb.join("/");
    folderAcceptedFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        // Handle individual image files
        const reader = new FileReader();
        const { path } = file;
        reader.onload = () => {
          const dataUrl = reader.result;

          let parsedPath = path.startsWith("/", 0)
            ? path.substring(1, path.length)
            : path;

          const converted: UploadedPhoto = {
            id: uuidv4(),
            path:
              localCurrentFolder !== ""
                ? `/${relativePath}/${parsedPath}`
                : `${parsedPath}`,
            base64: dataUrl as string,
            file: file,
          };

          appendImages([converted]);
        };
        reader.readAsDataURL(file);
      } else {
        // Handle individual file upload
        // Do something with the individual file
        if (file.path) {
          // Handle folder
          console.log("Folder:", file.path);
          // Do something with the folder
        } else {
          // Handle individual file
          console.log("File:", file.name);
          // Do something with the file
        }
      }
    });
  }, [folderAcceptedFiles]);

  // Handle the dropped files here HOVERING OVER a directory
  useEffect(() => {
    hoverFolderAcceptedFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        // Handle individual image files
        const reader = new FileReader();
        const { path } = file;
        reader.onload = () => {
          const dataUrl = reader.result;

          let parsedPath = path.startsWith("/", 0)
            ? path.substring(1, path.length)
            : path;

          const converted: UploadedPhoto = {
            id: uuidv4(),
            path: `/${droppedFolder}/${parsedPath}`,
            base64: dataUrl as string,
            file: file,
          };

          appendImages([converted]);
        };
        reader.readAsDataURL(file);
      } else {
        // Handle individual file upload
        // Do something with the individual file
        if (file.path) {
          // Handle folder
          console.log("Folder:", file.path);
          // Do something with the folder
        } else {
          // Handle individual file
          console.log("File:", file.name);
          // Do something with the file
        }
      }
    });
  }, [hoverFolderAcceptedFiles, droppedFolder]);

  const handleRghtClick = (e, clickedImage) => {
    e.preventDefault();
    setClickedImage(clickedImage);
    setClicked(true);
    setPoints({
      x: e.pageX,
      y: e.pageY,
    });
  };
  return (
    <>
      {PhotoLoading ? (
        <Box
          padding='6'
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
                <CreateFolder
                  setFolderName={setFolderName}
                  foldername={foldername}
                  handleAddFolder={handleAddFolder}
                />

                <>
                  <Flex key={"index"} width={"100%"} height={"100%"}>
                    <VStack
                      spacing={"8px"}
                      width={"100%"}
                      height={"100%"}
                      {...rootGetRootProps()}
                    >
                      <>
                        {Object.keys(folders)
                          .filter((folderName) => folderName !== "root")
                          .map((folderName, index) => {
                            return (
                              <Box key={index} width={"100%"}>
                                <Flex width={"100%"}>
                                  <Flex
                                    {...hoverFolderGetRootProps({
                                      onDrop: (event) =>
                                        onDropHover(
                                          hoverFolderAcceptedFiles,
                                          folderName
                                        ),
                                    })}
                                    width={"100%"}
                                  >
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
                                <Flex style={{ display: "none" }}></Flex>
                              </Box>
                            );
                          })}

                        {folders.root && folders.root.images.length !== 0 ? (
                          folders.root.images
                            .filter((img) =>
                              img.name
                                .split(".")[0]
                                .toLowerCase()
                                .includes(searchItem.toLowerCase())
                            )
                            .map((image: UploadedPhoto, index) => (
                              <Flex key={index} w='100%'>
                                <UploadedCard
                                  showButtons={true}
                                  handleRightClick={(e) =>
                                    handleRghtClick(e, image)
                                  }
                                  deleteImage={() => state.removeImage(image)}
                                  label={image.name}
                                  thumbnail={image.thumbnailBase64}
                                  key={image.id}
                                  size={image?.file?.size}
                                  type={image?.file?.type}
                                  path={image.path}
                                  removeImage={() => handleRemoveImage(image)}
                                  folderClick={() => {
                                    handleImagePreview(image);
                                  }}
                                />
                                {clicked && (
                                  <ContextMenu top={points.y} left={points.x}>
                                    <ul>
                                      <li>
                                        <CopyMoveImageModal
                                          folders={folders}
                                          clickedImage={clickedImage}
                                          isCopy
                                          setClicked={setClicked}
                                        />
                                      </li>
                                      <li>
                                        <CopyMoveImageModal
                                          folders={folders}
                                          clickedImage={clickedImage}
                                          setClicked={setClicked}
                                        />
                                      </li>
                                    </ul>
                                  </ContextMenu>
                                )}
                              </Flex>
                            ))
                        ) : (
                          <Center height={"100%"}>
                            <VStack spacing={"12px"}>
                              <FaFileUpload size={"40px"} />
                              <Text fontSize='lg' as='b'>
                                Drag and drop to upload files/folders root.
                              </Text>
                            </VStack>
                          </Center>
                        )}
                      </>
                    </VStack>
                  </Flex>
                </>
              </>
            ) : (
              <VStack
                spacing={"8px"}
                width={"100%"}
                height={"100%"}
                {...folderGetRootProps()}
              >
                <CreateFolder
                  setFolderName={setNestedFolderName}
                  foldername={nestedFoldername}
                  handleAddFolder={handleAddNestedFolder}
                />
                <>
                  {currentFolder &&
                    Object.keys(currentFolder)
                      .filter((folderName) => folderName !== "images")
                      .map((folderName, index) => {
                        return (
                          <Flex
                            key={index}
                            {...hoverFolderGetRootProps({
                              onDrop: (event) =>
                                onDropHover(
                                  hoverFolderAcceptedFiles,
                                  folderName
                                ),
                            })}
                            width={"100%"}
                          >
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
                  currentFolder?.images?.length >= 0 ? (
                    currentFolder.images
                      .filter((img) =>
                        img.name
                          .split(".")[0]
                          .toLowerCase()
                          .includes(searchItem.toLowerCase())
                      )
                      .map((image: UploadedPhoto, index) => (
                        <Box key={index} w='100%'>
                          <UploadedCard
                            showButtons={true}
                            label={image.name}
                            deleteImage={() => state.removeImage(image)}
                            handleRightClick={(e) => handleRghtClick(e)}
                            thumbnail={image.thumbnailBase64}
                            key={image.id}
                            size={image?.file?.size}
                            type={image?.file?.type}
                            path={image.path}
                            removeImage={() => handleRemoveImage(image)}
                            folderClick={() => handleImagePreview(image)}
                          />
                          {clicked && (
                            <ContextMenu top={points.y} left={points.x}>
                              <ul>
                                <li>
                                  <CopyMoveImageModal
                                    currentFolder={currentFolder}
                                    clickedImage={image}
                                    setClicked={setClicked}
                                    isCopy
                                  />
                                </li>
                                <li>
                                  <CopyMoveImageModal
                                    currentFolder={currentFolder}
                                    clickedImage={image}
                                    setClicked={setClicked}
                                  />
                                </li>
                              </ul>
                            </ContextMenu>
                          )}
                        </Box>
                      ))
                  ) : (
                    <Center height={"100%"}>
                      <VStack spacing={"12px"}>
                        <FaFileUpload size={"40px"} />
                        <Text fontSize='lg' as='b'>
                          Drag and drop files/folders to upload them.
                        </Text>
                      </VStack>
                    </Center>
                  )}
                </>
              </VStack>
            )}
          </Center>
        </>
      )}
    </>
  );
}

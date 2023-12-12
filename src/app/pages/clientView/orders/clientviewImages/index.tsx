import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  SimpleGrid,
  Image,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Card,
  CardBody,
  VStack,
  Center,
  SkeletonCircle,
  SkeletonText,
  Grid,
  GridItem,
  IconButton,
} from "@chakra-ui/react";
import { ImageCard } from "../../../../components/clientView/imageCard/imageCard";
import { BiArrowBack } from "react-icons/bi";
import { BsCloudDownload } from "react-icons/bs";
import { useMutation, useQuery } from "@apollo/client";
import {
  GetOrders,
  UpdateFavoritePhoto,
  UpdateVirtualPath,
} from "../../../../../apollo/orderQueries";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Folder, OrderDetails } from "../../../../components/interfaces";
import { useFullScreenHandle } from "react-full-screen";
import { useHookstate } from "@hookstate/core";
import {
  CLIENT_ROLE,
  EncryptData,
  tagsOptions,
} from "../../../../../constants";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { PurchasedImages } from "../../../../components/clientView/clientImages/purchasedImages";
import { FavouriteImages } from "../../../../components/clientView/clientImages/favouriteImages";
import { EditedImages } from "../../../../components/clientView/clientImages/editedImages";
import { RootImagesPresentation } from "../../../../components/clientView/clientImages/rootImagesPresentation";
import { FolderPresentationView } from "../../../../components/clientView/clientImages/folderPresentationView";
import { globalState } from "../../../../../state/store";
import { SendEmail } from "../../../../../apollo/userQueries";
import { appConfig } from "../../../../../config";
import { DownloadIcon } from "@chakra-ui/icons";

export const ClientViewImages = (props: { orderId; clientEmail }) => {
  const [folderStack, setFolderStack] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder>(null);

  const [dragBack, setDragBack] = useState(false);
  const [serachItem, setSerachItem] = useState("");
  const [presentationModeAll, setLaunchPresentationModeAll] = useState(false);
  const [presentationModeEdited, setLaunchPresentationModeEdited] =
    useState(false);
  const [presentationModePurchased, setLaunchPresentationModePurchased] =
    useState(false);
  const [presentationModeFavorites, setLaunchPresentationModeFavorites] =
    useState(false);
  const [presentationModeFolderImages, setLaunchPresentationModeFolderImages] =
    useState(false);
  const [slideShowIndexAllImages, setSlideShowIndexAllimages] = useState(0);
  const [slideShowIndexEditedImages, setSlideShowIndexEditedImages] =
    useState(0);
  const [slideShowIndexPurchased, setSlideShowIndexPurchased] = useState(0);
  const [slideShowIndexFavorite, setSlideShowIndexFavorite] = useState(0);
  const [slideShowIndexRootImages, setSlideShowIndexRootImages] = useState(0);
  const [viewImageAll, setViewImageAll] = useState(false);
  const [viewImageEdited, setViewImageEdited] = useState(false);
  const [viewImagePurchased, setViewImagePurchased] = useState(false);
  const [viewImageFavorite, setViewImageFavorite] = useState(false);
  const [viewImageRootImages, setViewImageRootImages] = useState(false);
  const [favoritesImages, setFavoriteImages] = useState<OrderDetails[]>([]);
  const [loader, setLoader] = useState(false);
  const [breadCrumb, setBreadCrumb] = useState<String[]>([]);
  const [OrderDataState, setOrderDataState] = useState<OrderDetails>({
    orders: { lookup: { products: [] } },
  });
  const [rootImages, setRootImages] = useState<OrderDetails[]>([]);

  const state = useHookstate(globalState);
  const stateUser = state.user.get();
  const ref: any = useRef();
  const handle = useFullScreenHandle();
  const height = useHookstate("500px");
  const isFullScreen = useHookstate(false);
  const slideInterval = useHookstate(NaN);
  const isPresenting = useHookstate(false);
  const mainCardStyle = {
    padding: "0",
    width: "100%",
    borderRadius: "4px",
    borderColor: "greys.300",
  };
  const mainCardStyle2 = {
    padding: "0",
    borderRadius: "4px",
    borderColor: "greys.300",
    minHeight: "600px",
  };

  const [currentTab, setCurrentTab] = useState(0);
  const {
    loading: OrderLoading,
    error: OrderError,
    data: OrderData,
    refetch: refetchOrder,
  } = useQuery(GetOrders, {
    variables: { orderId: props.orderId },
    onCompleted: () => {
      setLoader(false);
    },
    onError: () => {},
  });
  const [
    UpdatePhotoIsFavorite,
    {
      loading: updateIsFavLoading,
      error: updateIsFavError,
      data: updateIsFavData,
    },
  ] = useMutation(UpdateFavoritePhoto, {});

  const [
    UpdatePath,
    {
      loading: updateVirtualPathLoading,
      error: updateVirtualPathError,
      data: updateVirtualPathData,
    },
  ] = useMutation(UpdateVirtualPath, {});

  const [
    SendGalleryEmail,
    {
      loading: sendGalleryLoading,
      error: sendGalleryError,
      data: sendGalleryData,
    },
  ] = useMutation(SendEmail);

  function fullscreen() {
    handle.enter();
    height.set("100%");
  }

  function handleChange(state: boolean) {
    isFullScreen.set(state);
    if (!state) {
      clearInterval(slideInterval.get());
      isPresenting.set(false);
    }
  }

  useEffect(() => {
    if (OrderData) {
      setOrderDataState(OrderData);
    }
  }, [OrderData]);
  console.log("current folder", currentFolder);

  useEffect(() => {
    if (
      OrderData &&
      OrderData.orders &&
      OrderData.orders.lookup &&
      OrderData.orders.lookup.products
    ) {
      const favouritePhotos = OrderData?.orders?.lookup?.products
        ?.filter((product) => product.photo.isFavourite === true)
        .map((product) => product.photo);
      setFavoriteImages(favouritePhotos);
    }
  }, [OrderData]);

  const editedPhotos = OrderData?.orders?.lookup?.products
    ?.filter((product) => product.photo.stage === "EDITED")
    .map((product) => product.photo);
  const purchasedPhotos = OrderData?.orders?.lookup?.products
    ?.filter((product) => product.photo.stage === "PURCHASED")
    .map((product) => product.photo);

  const [folders, setFolders] = useState([{}]);

  useEffect(() => {
    const initialFolders: any = {};
    if (OrderData) {
      OrderData?.orders.lookup.products.forEach((nPath) => {
        const path = nPath.photo.virtualPath.split("/");
        let currentFolder = initialFolders;

        path.forEach((folderName, index) => {
          if (!currentFolder[folderName]) {
            currentFolder[folderName] = {
              images: [],
            };
          }

          if (index === path.length - 1) {
            currentFolder[folderName].images.push(nPath.photo);
          }

          currentFolder = currentFolder[folderName];
        });
      });

      setFolders(initialFolders);
    }
  }, [OrderData]);

  useEffect(() => {
    if (
      OrderData &&
      OrderData.orders &&
      OrderData.orders.lookup &&
      OrderData.orders.lookup.products
    ) {
      const rootFolder = OrderData?.orders?.lookup?.products
        ?.filter((product) => product.photo.virtualPath === "")
        .map((product) => product.photo);
      setRootImages(rootFolder);
    }
  }, [OrderData]);
  const handleFolderClick = (folderData, folders) => {
    setBreadCrumb((prevStack) => [...prevStack, folders]);
    setFolderStack((prevStack) => [...prevStack, currentFolder]);
    setCurrentFolder(folderData);
  };

  const handleBackClick = () => {
    const prevFolder: any = folderStack.pop();
    setCurrentFolder(prevFolder);
    setFolderStack([...folderStack]);
    setBreadCrumb((prevStack) => prevStack.slice(0, prevStack.length - 1));
  };

  const handleTabSelect = (tabName) => {
    setCurrentTab(tabName);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (destination.droppableId.startsWith("folder-")) {
      const folderName = destination.droppableId.split("-")[1];
      setCurrentFolder((prevState) => {
        const newImages = prevState.images.filter(
          (image) => image.id !== draggableId
        );
        const movedImage = prevState.images.find(
          (image) => image.id === draggableId
        );
        // Update the virtualPath property of the moved image
        const updatedImage = {
          ...movedImage,
          virtualPath: `${movedImage?.virtualPath}/${folderName}`,
        };
        UpdatePath({
          variables: {
            updatedBy: stateUser?.uid,
            virtualPath: updatedImage.virtualPath,
            id: updatedImage.id,
          },
        }).then((val) => {
          if (val.data) {
            refetchOrder();
          }
        });
        const folderImages = prevState[folderName].images.concat(
          prevState.images.find((image) => image.id === draggableId)
        );
        return {
          ...prevState,
          images: newImages,
          [folderName]: {
            ...prevState[folderName],
            images: folderImages,
          },
        };
      });
      setDragBack(false);
    } else if (destination && destination.droppableId.startsWith("root-")) {
      const folderId = destination.droppableId.split("-")[1]; // Extract the folder ID from the droppableId

      // Find the image that was dragged using the source index
      const draggedImage = rootImages.find(
        (img, index) => index === source.index
      );
      if (draggedImage) {
        const updatedRootImages = rootImages.filter(
          (img, index) => index !== source.index
        );
        setRootImages(updatedRootImages);
        setFolders((prevFolders) => {
          const updatedFolders = { ...prevFolders };

          if (updatedFolders[folderId] && updatedFolders[folderId].images) {
            updatedFolders[folderId].images.push(draggedImage);
          } else {
            updatedFolders[folderId] = { images: [draggedImage] };
          }

          return updatedFolders;
        });
        UpdatePath({
          variables: {
            updatedBy: stateUser?.uid,
            virtualPath: folderId,
            id: draggedImage.id,
          },
        }).then((val) => {
          if (val.data) {
            refetchOrder();
          }
        });
      }
    } else if (destination.droppableId === "images-root") {
      const newRootImages = Array.from(rootImages);
      newRootImages.splice(source.index, 1);
      newRootImages.splice(
        destination.index,
        0,
        rootImages.find((image) => image.id === draggableId)
      );

      // Update the rootImages array
      setRootImages(newRootImages);
    } else if (destination.droppableId === "moveBack") {
      const prevFolder = folderStack.pop();
      if (!prevFolder || !prevFolder.images) {
        const movedImageIndex = currentFolder.images.findIndex(
          (image) => image.id === draggableId
        );
        const movedImage = currentFolder.images[movedImageIndex];
        const updatedImages = currentFolder.images.filter(
          (image) => image.id !== movedImage.id
        );
        setCurrentFolder((prevFolder) => ({
          ...prevFolder,
          images: updatedImages,
        }));
        setFolders((prevFolders) => {
          const updatedFolders = { ...prevFolders };

          const removeImageFromFolder = (folders, imageId) => {
            for (const key in folders) {
              const folder = folders[key];
              if (folder && folder.images) {
                const updatedImages = folder.images.filter(
                  (image) => image.id !== imageId
                );
                folder.images = updatedImages;
              } else if (typeof folder === "object") {
                removeImageFromFolder(folder, imageId);
              }
            }
          };
          const moveImageToRoot = (folders, image) => {
            if (folders.hasOwnProperty("")) {
              folders[""].images.push(image);
            } else {
              for (const key in folders) {
                const folder = folders[key];
                if (typeof folder === "object") {
                  moveImageToRoot(folder, image);
                }
              }
            }
          };
          removeImageFromFolder(updatedFolders, movedImage.id);
          moveImageToRoot(updatedFolders, movedImage);
          return updatedFolders;
        });
        setRootImages((prevRootImages) => [...prevRootImages, movedImage]);

        UpdatePath({
          variables: {
            updatedBy: stateUser?.uid,
            virtualPath: "",
            id: movedImage.id,
          },
        }).then((val) => {
          if (val.data) {
            refetchOrder();
          }
        });
        return;
      }

      const movedImageIndex = currentFolder.images.findIndex(
        (image) => image.id === draggableId
      );
      if (movedImageIndex === -1) {
        // handle error or return early
        return;
      }

      const newImages = Array.from(prevFolder.images);
      const movedImage = currentFolder.images[movedImageIndex];

      const virtualPath = movedImage.virtualPath;
      const folderNames = virtualPath.split("/"); // Split the virtual path into an array of folder names
      folderNames.pop(); // Remove the last folder name from the array
      const updatedVirtualPath = folderNames.join("/"); // Join the array back into a string with "/" separator
      UpdatePath({
        variables: {
          updatedBy: stateUser?.uid,
          virtualPath: updatedVirtualPath,
          id: movedImage.id,
        },
      }).then((val) => {
        if (val.data) {
          refetchOrder();
        }
      });
      newImages.push(movedImage);
      setCurrentFolder({
        ...currentFolder,
        images: currentFolder.images.filter(
          (_, index) => index !== movedImageIndex
        ),
      });
      // setBreadCrumb((prevStack) => prevStack.slice(0, prevStack.length - 1));

      setFolderStack((prevStack) => {
        const updatedStack = [...prevStack];
        updatedStack[updatedStack.length - 1] = {
          ...prevFolder,
          images: newImages,
        };
        setDragBack(false);
        return updatedStack;
      });
    } else {
      // If destination is the images droppable, update the current folder's images array
      const newImages = Array.from(currentFolder?.images);
      newImages.splice(source.index, 1);
      newImages.splice(
        destination.index,
        0,
        currentFolder?.images.find((image) => image.id === draggableId)
      );
      setCurrentFolder({
        ...currentFolder,
        images: newImages,
      });
      setDragBack(false);
    }
  };

  const onDragStart = () => {
    setDragBack(true);
  };

  const handlePresentationMode = () => {
    switch (currentTab) {
      case 0:
        if (currentFolder !== null) {
          setLaunchPresentationModeFolderImages(true);
        } else {
          setLaunchPresentationModeAll(true);
        }
        break;
      case 1:
        setLaunchPresentationModeEdited(true);
        break;
      case 2:
        setLaunchPresentationModePurchased(true);
        break;
      case 3:
        setLaunchPresentationModeFavorites(true);
        break;
    }
  };
  const handleDoubleClickAll = (index) => {
    // setViewImageRootImages(true);
    // setSlideShowIndexRootImages(index);
    setViewImageAll(true);
    setSlideShowIndexAllimages(index);
  };
  const handleDoubleClickFav = (index) => {
    setViewImageFavorite(true);
    setSlideShowIndexFavorite(index);
  };

  const handleDoubleClickPurchased = (index) => {
    setViewImagePurchased(true);
    setSlideShowIndexPurchased(index);
  };

  const handleDoubleClickEdited = (index) => {
    setViewImageEdited(true);
    setSlideShowIndexEditedImages(index);
  };
  const handleDoubleClickRootImages = (index) => {
    setViewImageRootImages(true);
    setSlideShowIndexRootImages(index);
  };

  const handleGalleryView = () => {
    SendGalleryEmail({
      variables: {
        email: {
          subject: "Gallery View",
          email: props.clientEmail,
          content: `
                                    <html>
                                      <body>
                                        <p>Hi there,</p>

                                        <p>
                                          You've been invited to explore our gallery view feature to see our amazing creations:
                                        </p>

                                        <p>
                                          To get started, simply click on the link below:
                                        </p>
                                        <p>
                                        ${
                                          appConfig.FRONTEND_URL
                                        }/mystudio/imageGalleryView?orderId=${EncryptData(
            props.orderId
          )}
                                        </p>

                                        <p>
                                          We look forward to seeing you there!
                                        </p>

                                        <p>Best regards,</p>
                                        <p>The ${stateUser?.firstname} ${
            stateUser?.lastname
          } Team</p>
                                      </body>
                                    </html>
                                    `,
        },
      },
      onCompleted: () => {
        alert("Link For Gallery View Page Has Been Sent To Your Email");
      },
    });
  };

  const handleFavouriteClick = (image) => {
    setOrderDataState((prevData) => {
      const updatedProducts = prevData.orders.lookup.products.map((product) => {
        if (product.photo.id === image.id) {
          const updatedProduct = {
            ...product,
            photo: {
              ...product.photo,
              isFavourite: !product.photo.isFavourite, // Toggle the isFavourite property
            },
          };

          // Update favorite photos array immediately
          if (updatedProduct.photo.isFavourite) {
            setFavoriteImages((prevFavorites) => [
              ...prevFavorites,
              updatedProduct.photo,
            ]);
            UpdatePhotoIsFavorite({
              variables: {
                updatedBy: stateUser?.uid,
                isFavourite: true,
                id: image.id,
              },
            });
          } else {
            setFavoriteImages((prevFavorites) =>
              prevFavorites.filter((favorite) => favorite.id !== image.id)
            );
            UpdatePhotoIsFavorite({
              variables: {
                updatedBy: stateUser?.uid,
                isFavourite: false,
                id: image.id,
              },
            });
          }

          return updatedProduct;
        }
        return product;
      });

      return {
        ...prevData,
        orders: {
          ...prevData.orders,
          lookup: {
            ...prevData.orders.lookup,
            products: updatedProducts,
          },
        },
      };
    });

    if (image.virtualPath !== "") {
      setCurrentFolder((prevFolder) => {
        if (!prevFolder) {
          // Handle the case when prevFolder is undefined
          return null; // or return an empty object or an appropriate default value
        }
        const updatedImages = prevFolder?.images.map((img) => {
          if (img.id === image.id) {
            return {
              ...img,
              isFavourite: !img.isFavourite, // Toggle the isFavourite property
            };
          }
          return img;
        });

        return {
          ...prevFolder,
          images: updatedImages,
        };
      });
    } else {
      setRootImages((prevRootImages) => {
        return prevRootImages.map((img) => {
          if (img.id === image.id) {
            return {
              ...img,
              isFavourite: !img.isFavourite, // Toggle the isFavourite property
            };
          }
          return img;
        });
      });
    }
  };

  const handleDownloadClick = (image) => {
    // console.log("Image download clicked:", image);

    // Decode base64 data
    const binaryData = atob(image.resizedContent);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: `image/${image.type}` });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = image.name;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFolderDownload = (currentFolder) => {
    // console.log("Folderbutton Clicked:", currentFolder);
    currentFolder.images.forEach((image, index) => {
      downloadImage(image, index + 1);
    });
  };

  const downloadImage = (image, index) => {
    // console.log(image.name);
    const binaryData = atob(image.resizedContent);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: `image/${image.type}` });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = image.name;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Box height="100%">
        <Grid
          templateAreas={`"header"
                  "content"
                  "footer"`}
          gridTemplateRows={"0 1fr 41px"}
          gridTemplateColumns={"1fr"}
          h="100%"
        >
          <GridItem px="24px" paddingBottom="16px" area={"content"}>
            <Tabs variant="soft-rounded" onChange={handleTabSelect}>
              <Card variant="outline" style={mainCardStyle2}>
                <CardBody>
                  <Flex justifyContent="space-between">
                    <HStack>
                      <TabList>
                        {tagsOptions.map((ele, index) => {
                          return (
                            <Tab
                              key={index}
                              _selected={{ background: "black" }}
                              ml="5px"
                              borderRadius="full"
                              border="1px solid rgba(0, 0, 0, 0.6)"
                              color="grey"
                              fontSize="p5"
                            >
                              {ele.name}
                            </Tab>
                          );
                        })}
                      </TabList>
                      <Input
                        type="text"
                        placeholder="Search image name"
                        w="232px"
                        h="30px"
                        onChange={(e) => setSerachItem(e.target.value)}
                      />
                    </HStack>
                    <Box>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFolderDownload(currentFolder)}
                      >
                        Download Images
                      </Button>
                    </Box>
                  </Flex>
                  <TabPanels>
                    <TabPanel>
                      {currentFolder ? (
                        <Box>
                          {viewImageAll || presentationModeFolderImages ? (
                            <FolderPresentationView
                              currentFolder={currentFolder}
                              viewImageAll={viewImageAll}
                              setViewImageAll={setViewImageAll}
                              setLaunchPresentationModeFolderImages={
                                setLaunchPresentationModeFolderImages
                              }
                              isFullScreen={isFullScreen}
                              fullscreen={fullscreen}
                              handle={handle}
                              handleChange={handleChange}
                              slideShowIndexAllImages={slideShowIndexAllImages}
                            />
                          ) : (
                            <Card variant="outline" style={mainCardStyle}>
                              <CardBody padding="16px">
                                <DragDropContext
                                  onDragEnd={onDragEnd}
                                  onDragStart={onDragStart}
                                >
                                  <Droppable droppableId="moveBack">
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                      >
                                        <HStack
                                          spacing="18px"
                                          bg={
                                            snapshot.isDraggingOver
                                              ? "#a9c4c4"
                                              : "white"
                                          }
                                        >
                                          <BiArrowBack
                                            size={30}
                                            onClick={handleBackClick}
                                            style={{ cursor: "pointer" }}
                                          />
                                          {breadCrumb.map((folder, index) => (
                                            <React.Fragment key={index}>
                                              <Text
                                                fontSize="p4"
                                                fontWeight="400"
                                              >
                                                {folder}
                                              </Text>
                                              {index <
                                                breadCrumb.length - 1 && (
                                                <Text>/</Text>
                                              )}
                                            </React.Fragment>
                                          ))}
                                          {provided.placeholder}
                                        </HStack>
                                      </div>
                                    )}
                                  </Droppable>
                                  <VStack mt="100px">
                                    <Box mt="30px">
                                      <Center>
                                        <VStack spacing="30px">
                                          <SimpleGrid
                                            columns={4}
                                            spacing="30px"
                                            width="100%"
                                          >
                                            {Object.keys(currentFolder)
                                              .filter((key) => key !== "images")
                                              .map((ele, index) => {
                                                const droppableId = `folder-${ele}-${index}`;
                                                return (
                                                  <Droppable
                                                    droppableId={droppableId}
                                                    key={index}
                                                  >
                                                    {(provided, snapshot) => (
                                                      <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        style={{
                                                          minHeight: "120px", // Adjust the height as needed
                                                          minWidth: "100px", // Adjust the width as needed
                                                        }}
                                                      >
                                                        <ImageCard
                                                          folderName={ele}
                                                          folderClick={() =>
                                                            handleFolderClick(
                                                              currentFolder[
                                                                ele
                                                              ],
                                                              ele
                                                            )
                                                          }
                                                          key={`folder-${index}`}
                                                          bg={
                                                            snapshot.isDraggingOver
                                                              ? "#a9c4c4"
                                                              : "#E3E3E3"
                                                          }
                                                        />

                                                        {provided.placeholder}
                                                      </div>
                                                    )}
                                                  </Droppable>
                                                );
                                              })}
                                          </SimpleGrid>

                                          <Droppable droppableId="images">
                                            {(provided) => (
                                              <SimpleGrid
                                                columns={4}
                                                spacing="20px"
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                              >
                                                {currentFolder.images
                                                  ?.filter((img) =>
                                                    img.name
                                                      .split(".")[0]
                                                      .toLowerCase()
                                                      .includes(
                                                        serachItem.toLowerCase()
                                                      )
                                                  )
                                                  .map((image, index) => (
                                                    <Draggable
                                                      key={index}
                                                      draggableId={image.id}
                                                      index={index}
                                                    >
                                                      {(provided) => (
                                                        <Box
                                                          ref={
                                                            provided.innerRef
                                                          }
                                                          {...provided.draggableProps}
                                                          {...provided.dragHandleProps}
                                                        >
                                                          <img
                                                            src={`data:image/png;base64,${image.resizedContent}`}
                                                            height="300px"
                                                            width="300px"
                                                            alt="img"
                                                            style={{
                                                              cursor: "pointer",
                                                            }}
                                                            onDoubleClick={() =>
                                                              handleDoubleClickAll(
                                                                index
                                                              )
                                                            }
                                                          />
                                                          <Center>
                                                            <Text
                                                              fontSize="p5"
                                                              fontWeight="400"
                                                            >
                                                              {
                                                                image.name.split(
                                                                  "."
                                                                )[0]
                                                              }
                                                            </Text>
                                                            <IconButton
                                                              icon={
                                                                image.isFavourite ? (
                                                                  <AiFillHeart color="red" />
                                                                ) : (
                                                                  <AiOutlineHeart />
                                                                )
                                                              }
                                                              variant="ghost"
                                                              onClick={() =>
                                                                handleFavouriteClick(
                                                                  image
                                                                )
                                                              }
                                                              aria-label="Favourite"
                                                            />
                                                            <IconButton
                                                              aria-label="Download"
                                                              icon={
                                                                <BsCloudDownload />
                                                              }
                                                              variant="ghost"
                                                              onClick={() => {
                                                                handleDownloadClick(
                                                                  image
                                                                );
                                                              }}
                                                            />
                                                          </Center>
                                                        </Box>
                                                      )}
                                                    </Draggable>
                                                  ))}
                                                {provided.placeholder}
                                              </SimpleGrid>
                                            )}
                                          </Droppable>
                                        </VStack>
                                      </Center>
                                    </Box>
                                  </VStack>
                                </DragDropContext>
                              </CardBody>
                            </Card>
                          )}
                        </Box>
                      ) : (
                        <Box mt="20px">
                          {OrderLoading || loader ? (
                            <Box
                              padding="6"
                              boxShadow="lg"
                              bg="greys.400"
                              width="100%"
                              minH="235px"
                              maxH="235px"
                              mt="20px"
                              borderRadius="4px"
                            >
                              <SkeletonCircle
                                size="10"
                                startColor="greys.200"
                                endColor="greys.600"
                              />
                              <SkeletonText
                                mt="4"
                                noOfLines={5}
                                spacing="4"
                                skeletonHeight="5"
                              />
                            </Box>
                          ) : viewImageRootImages || presentationModeAll ? (
                            <RootImagesPresentation
                              rootImages={rootImages}
                              viewImageRootImages={viewImageRootImages}
                              setViewImageRootImages={setViewImageRootImages}
                              setLaunchPresentationModeAll={
                                setLaunchPresentationModeAll
                              }
                              isFullScreen={isFullScreen}
                              fullscreen={fullscreen}
                              handle={handle}
                              handleChange={handleChange}
                              slideShowIndexRootImages={
                                slideShowIndexRootImages
                              }
                            />
                          ) : (
                            <>
                              <VStack spacing="30px">
                                <DragDropContext
                                  onDragEnd={onDragEnd}
                                  onDragStart={onDragStart}
                                >
                                  <SimpleGrid
                                    columns={4}
                                    spacing="30px"
                                    width="100%"
                                  >
                                    {Object.keys(folders)
                                      .filter((folder) => folder !== "")
                                      .map((ele, index) => {
                                        const droppableId = `root-${ele}-${index}`;
                                        return (
                                          <Droppable
                                            droppableId={droppableId}
                                            key={index}
                                          >
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                style={{
                                                  minHeight: "120px", // Adjust the height as needed
                                                  minWidth: "100px", // Adjust the width as needed
                                                }}
                                              >
                                                <ImageCard
                                                  folderName={ele}
                                                  folderClick={() =>
                                                    handleFolderClick(
                                                      folders[ele],
                                                      ele
                                                    )
                                                  }
                                                  key={`folder-${index}`}
                                                  bg={
                                                    snapshot.isDraggingOver
                                                      ? "#a9c4c4"
                                                      : "#E3E3E3"
                                                  }
                                                />

                                                {provided.placeholder}
                                              </div>
                                            )}
                                          </Droppable>
                                        );
                                      })}
                                  </SimpleGrid>

                                  <Droppable droppableId="images-root">
                                    {(provided) => (
                                      <SimpleGrid
                                        columns={4}
                                        spacing="20px"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                      >
                                        {rootImages
                                          .filter((img) =>
                                            img.name
                                              .split(".")[0]
                                              .toLowerCase()
                                              .includes(
                                                serachItem.toLowerCase()
                                              )
                                          )
                                          .map((image, index) => (
                                            <Draggable
                                              key={index}
                                              draggableId={image.id}
                                              index={index}
                                            >
                                              {(provided) => (
                                                <Box
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                >
                                                  <img
                                                    src={`data:image/png;base64,${image.resizedContent}`}
                                                    height="300px"
                                                    width="300px"
                                                    alt="img"
                                                    style={{
                                                      cursor: "pointer",
                                                    }}
                                                    onDoubleClick={() =>
                                                      handleDoubleClickRootImages(
                                                        index
                                                      )
                                                    }
                                                  />
                                                  <Center>
                                                    <Text
                                                      fontSize="p5"
                                                      fontWeight="400"
                                                    >
                                                      {image.name.split(".")[0]}
                                                    </Text>
                                                    <IconButton
                                                      icon={
                                                        image.isFavourite ? (
                                                          <AiFillHeart color="red" />
                                                        ) : (
                                                          <AiOutlineHeart />
                                                        )
                                                      }
                                                      variant="ghost"
                                                      onClick={() =>
                                                        handleFavouriteClick(
                                                          image
                                                        )
                                                      }
                                                      aria-label="Favourite"
                                                    />
                                                  </Center>
                                                </Box>
                                              )}
                                            </Draggable>
                                          ))}
                                        {provided.placeholder}
                                      </SimpleGrid>
                                    )}
                                  </Droppable>
                                </DragDropContext>
                              </VStack>
                            </>
                          )}
                        </Box>
                      )}
                    </TabPanel>
                    <TabPanel>
                      <EditedImages
                        OrderLoading={OrderLoading}
                        presentationModeEdited={presentationModeEdited}
                        viewImageEdited={viewImageEdited}
                        setViewImageEdited={setViewImageEdited}
                        setLaunchPresentationModeEdited={
                          setLaunchPresentationModeEdited
                        }
                        handle={handle}
                        handleChange={handleChange}
                        ref={ref}
                        isFullScreen={isFullScreen}
                        fullscreen={fullscreen}
                        editedPhotos={editedPhotos}
                        slideShowIndexEditedImages={slideShowIndexEditedImages}
                        serachItem={serachItem}
                        handleDoubleClickEdited={handleDoubleClickEdited}
                      />
                    </TabPanel>
                    <TabPanel>
                      <PurchasedImages
                        OrderLoading={OrderLoading}
                        presentationModePurchased={presentationModePurchased}
                        viewImagePurchased={viewImagePurchased}
                        setViewImagePurchased={setViewImagePurchased}
                        setLaunchPresentationModePurchased={
                          setLaunchPresentationModePurchased
                        }
                        handle={handle}
                        handleChange={handleChange}
                        ref={ref}
                        isFullScreen={isFullScreen}
                        fullscreen={fullscreen}
                        purchasedPhotos={purchasedPhotos}
                        slideShowIndexPurchased={slideShowIndexPurchased}
                        serachItem={serachItem}
                        handleDoubleClickPurchased={handleDoubleClickPurchased}
                      />
                    </TabPanel>
                    <TabPanel>
                      <FavouriteImages
                        OrderLoading={OrderLoading}
                        presentationModeFavorites={presentationModeFavorites}
                        viewImageFavorite={viewImageFavorite}
                        setViewImageFavorite={setViewImageFavorite}
                        setLaunchPresentationModeFavorites={
                          setLaunchPresentationModeFavorites
                        }
                        handle={handle}
                        handleChange={handleChange}
                        ref={ref}
                        isFullScreen={isFullScreen}
                        fullscreen={fullscreen}
                        favoritesImages={favoritesImages}
                        slideShowIndexFavorite={slideShowIndexFavorite}
                        serachItem={serachItem}
                        handleDoubleClickFav={handleDoubleClickFav}
                      />
                    </TabPanel>
                  </TabPanels>
                </CardBody>
              </Card>
            </Tabs>
          </GridItem>

          <GridItem
            padding={"8px 10px"}
            area={"footer"}
            bg="greys.200"
            height="50px"
            ml="-15px"
          >
            {stateUser?.role?.name !== CLIENT_ROLE.name && (
              <Flex justifyContent="end">
                <Button
                  isLoading={OrderLoading || sendGalleryLoading}
                  size="sm"
                  variant="outline"
                  onClick={handleGalleryView}
                >
                  Send Gallery
                </Button>
                <Button
                  isLoading={OrderLoading}
                  size="sm"
                  onClick={handlePresentationMode}
                >
                  Launch Presentation Mode
                </Button>
              </Flex>
            )}
          </GridItem>
        </Grid>
      </Box>
    </>
  );
};

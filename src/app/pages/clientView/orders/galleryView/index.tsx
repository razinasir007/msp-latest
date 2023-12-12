import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Image,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Card,
  CardBody,
  Center,
  SkeletonCircle,
  SkeletonText,
  Grid,
  GridItem,
  IconButton,
} from "@chakra-ui/react";
import Masonry from "react-masonry-css";
import { useMutation, useQuery } from "@apollo/client";
import {
  GetOrders,
  UpdateFavoritePhoto,
} from "../../../../../apollo/orderQueries";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { useHookstate } from "@hookstate/core";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { DecryptData, tagsOptions } from "../../../../../constants";
import { OrderDetails } from "../../../../components/interfaces";
// import { useFirebaseAuth } from "../../../../auth";
import { FavouriteImages } from "../../../../components/clientView/clientImages/favouriteImages";
import { PurchasedImages } from "../../../../components/clientView/clientImages/purchasedImages";
import { EditedImages } from "../../../../components/clientView/clientImages/editedImages";

export default function GalleryImagesView() {
  const [serachItem, setSerachItem] = useState("");
  const [presentationViewAll, setPresentationModeAll] = useState(false);
  const [presentationViewEdited, setPresentationModeEdited] = useState(false);
  const [presentationViewPurchased, setPresentationModePurchased] =
    useState(false);
  const [presentationViewFavorites, setPresentationModeFavorites] =
    useState(false);
  const [slideShowIndexAllImages, setSlideShowIndexAllimages] = useState(0);
  const [slideShowIndexEditedImages, setSlideShowIndexEditedImages] =
    useState(0);
  const [slideShowIndexPurchased, setSlideShowIndexPurchased] = useState(0);
  const [slideShowIndexFavorite, setSlideShowIndexFavorite] = useState(0);
  const [favoritesImages, setFavoriteImages] = useState<OrderDetails[]>([]);
  const [pruchasedImages, setPurchasedImages] = useState<OrderDetails[]>([]);
  const [editedImages, setEditedImages] = useState<OrderDetails[]>([]);
  const [OrderDataState, setOrderDataState] = useState<OrderDetails>({
    orders: { lookup: { products: [] } },
  });

  // const { user } = useFirebaseAuth();
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
    marginTop: "10px",
  };
  const url = window.location.href;
  const encryptedId = url.split("orderId=")[1];

  const {
    loading: OrderLoading,
    error: OrderError,
    data: OrderData,
  } = useQuery(GetOrders, {
    variables: { orderId: DecryptData(encryptedId) },
  });

  const [
    UpdatePhotoIsFavorite,
    {
      loading: updateIsFavLoading,
      error: updateIsFavError,
      data: updateIsFavData,
    },
  ] = useMutation(UpdateFavoritePhoto, {});

  function fullscreen() {
    handle.enter();
    height.set("700px");
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

  // const favouritePhotos = OrderData?.orders?.lookup?.products?.filter(product => product.isFavourite).map(product => product.photo);
  useEffect(() => {
    if (
      OrderData &&
      OrderData.orders &&
      OrderData.orders.lookup &&
      OrderData.orders.lookup.products
    ) {
      const editedPhotos = OrderData?.orders?.lookup?.products
        ?.filter((product) => product.photo.stage === "EDITED")
        .map((product) => product.photo);
      const purchasedPhotos = OrderData?.orders?.lookup?.products
        ?.filter((product) => product.photo.stage === "PURCHASED")
        .map((product) => product.photo);
      const favouritePhotos = OrderData?.orders?.lookup?.products
        ?.filter((product) => product.photo.isFavourite === true)
        .map((product) => product.photo);
      setFavoriteImages(favouritePhotos);
      setEditedImages(editedPhotos);
      setPurchasedImages(purchasedPhotos);
    }
  }, [OrderData]);

  const handleDoubleClick = (index) => {
    setPresentationModeAll(true);
    setSlideShowIndexAllimages(index);
  };

  const handleDoubleClickEdited = (index) => {
    setPresentationModeEdited(true);
    setSlideShowIndexEditedImages(index);
  };
  const handleDoubleClickPurchased = (index) => {
    setPresentationModePurchased(true);
    setSlideShowIndexPurchased(index);
  };
  const handleDoubleClickFavorites = (index, ele) => {
    setPresentationModeFavorites(true);
    setSlideShowIndexFavorite(index);
  };
  const handleFavouriteClick = (image) => {
    setOrderDataState((prevData: any) => {
      const updatedProducts = prevData.orders.lookup.products.map((product) => {
        if (product.photo.id === image.photo.id) {
          const updatedProduct = {
            ...product,
            photo: {
              ...product.photo,
              isFavourite: !product.photo.isFavourite, // Toggle the isFavourite property
            },
          };
          // Update favorite photos array immediately
          // if (updatedProduct.photo.isFavourite) {
          //   setFavoriteImages((prevFavorites) => [
          //     ...prevFavorites,
          //     updatedProduct.photo,
          //   ]);
          //   UpdatePhotoIsFavorite({
          //     variables: {
          //       updatedBy: user?.uid,
          //       isFavourite: true,
          //       id: image.photo.id,
          //     },
          //   });
          // } else {
          //   setFavoriteImages((prevFavorites) =>
          //     prevFavorites.filter((favorite) => favorite.id !== image.photo.id)
          //   );
          //   UpdatePhotoIsFavorite({
          //     variables: {
          //       updatedBy: user?.uid,
          //       isFavourite: false,
          //       id: image.photo.id,
          //     },
          //   });
          // }

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
  };
  return (
    <>
      <Grid
        templateAreas={`"header"
              "content"
              "footer"`}
        gridTemplateRows={"35px 1fr 61px"}
        gridTemplateColumns={"1fr"}
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          <HStack spacing='10px'>
            {/* <IoChevronBackCircleSharp
              size={35}
              color='#EAE8E3'
              onClick={() => navigate(-1)}
              style={{ cursor: "pointer" }}
            /> */}
            <Text w='100%' fontSize='h2' fontWeight='600' lineHeight='35px'>
              Order #{DecryptData(encryptedId)}
            </Text>
          </HStack>
        </GridItem>
      </Grid>
      <Box height='100%'>
        <Grid
          templateAreas={`"header"
                  "content"
                  "footer"`}
          gridTemplateRows={"0 1fr 41px"}
          gridTemplateColumns={"1fr"}
          h='100%'
        >
          <GridItem px='24px' paddingBottom='16px' area={"content"}>
            <Tabs variant='soft-rounded'>
              <Card variant='outline' style={mainCardStyle}>
                <CardBody>
                  <Flex justifyContent='space-between'>
                    <HStack>
                      <TabList>
                        {tagsOptions.map((ele) => {
                          return (
                            <Tab
                              _selected={{ background: "black" }}
                              ml='5px'
                              borderRadius='full'
                              border='1px solid rgba(0, 0, 0, 0.6)'
                              color='grey'
                              fontSize='p5'
                            >
                              {ele.name}
                            </Tab>
                          );
                        })}
                      </TabList>
                      <Input
                        type='text'
                        placeholder='Search image name'
                        w='232px'
                        h='30px'
                        onChange={(e) => setSerachItem(e.target.value)}
                      />
                    </HStack>
                    {/* <Box>
                      <Button variant='outline' size='sm'>
                        Upload Images
                      </Button>
                    </Box> */}
                  </Flex>
                  <TabPanels>
                    <TabPanel>
                      {OrderLoading ? (
                        <Box
                          padding='6'
                          boxShadow='lg'
                          bg='greys.400'
                          width='100%'
                          minH='235px'
                          maxH='235px'
                          mt='20px'
                          borderRadius='4px'
                        >
                          <SkeletonCircle
                            size='10'
                            startColor='greys.200'
                            endColor='greys.600'
                          />
                          <SkeletonText
                            mt='4'
                            noOfLines={5}
                            spacing='4'
                            skeletonHeight='5'
                          />
                        </Box>
                      ) : presentationViewAll ? (
                        <>
                          <Flex
                            justifyContent='space-between'
                            mb='20px'
                            mt='20px'
                          >
                            <Text fontSize='h5' fontWeight='400'>
                              Presentation View For All Images
                            </Text>
                            <MdClose
                              size={30}
                              style={{ cursor: "pointer" }}
                              onClick={() => setPresentationModeAll(false)}
                            />
                          </Flex>
                          <Box>
                            <FullScreen handle={handle} onChange={handleChange}>
                              <Splide
                                style={{ height: "500px" }}
                                ref={ref}
                                options={{
                                  type: "loop",
                                  start: slideShowIndexAllImages,
                                }}
                                aria-label='React Splide Example'
                              >
                                {OrderData.orders.lookup.products.map(
                                  (image) => {
                                    return (
                                      <SplideSlide key={image.id}>
                                        <Flex
                                          alignItems='center'
                                          justifyContent='center'
                                          bg='#FFFAFA'
                                          padding='0'
                                          height={500}
                                        >
                                          {!isFullScreen.get() && (
                                            <BsArrowsAngleExpand
                                              onClick={() => fullscreen()}
                                              style={{
                                                position: "absolute",
                                                top: 10,
                                                right: 10,
                                                cursor: "pointer",
                                                color: "darkgrey",
                                              }}
                                            />
                                          )}
                                          <Image
                                            src={`data:image/png;base64,${image.photo.resizedContent}`}
                                            height='100%'
                                          />
                                        </Flex>
                                      </SplideSlide>
                                    );
                                  }
                                )}
                              </Splide>
                            </FullScreen>
                          </Box>
                        </>
                      ) : (
                        <Masonry
                          breakpointCols={3}
                          className='my-masonry-grid'
                          columnClassName='my-masonry-grid_column'
                        >
                          {OrderDataState.orders.lookup.products
                            .filter((img) =>
                              img.photo.name
                                .split(".")[0]
                                .toLowerCase()
                                .includes(serachItem.toLowerCase())
                            )
                            .map((ele, index) => {
                              return (
                                <Box>
                                  <Image
                                    src={`data:image/png;base64,${ele.photo.resizedContent}`}
                                    style={{ width: "500px", height: "300px" }}
                                    // onDoubleClick={() => setPresentationModeAll(true)}
                                    onDoubleClick={() =>
                                      handleDoubleClick(index)
                                    }
                                    cursor='pointer'
                                  />
                                  <Center>
                                    <Text fontSize='p5' fontWeight='400'>
                                      {ele.photo.name.split(".")[0]}
                                    </Text>
                                    <IconButton
                                      icon={
                                        ele.photo.isFavourite ? (
                                          <AiFillHeart color='red' />
                                        ) : (
                                          <AiOutlineHeart />
                                        )
                                      }
                                      variant='ghost'
                                      onClick={() => handleFavouriteClick(ele)}
                                      aria-label='Favourite'
                                    />
                                  </Center>
                                </Box>
                              );
                            })}
                        </Masonry>
                      )}
                    </TabPanel>
                    <TabPanel>
                      <EditedImages
                        OrderLoading={OrderLoading}
                        viewImageEdited={presentationViewEdited}
                        setViewImageEdited={setPresentationModeEdited}
                        handle={handle}
                        handleChange={handleChange}
                        ref={ref}
                        isFullScreen={isFullScreen}
                        fullscreen={fullscreen}
                        editedPhotos={editedImages}
                        slideShowIndexEditedImages={slideShowIndexEditedImages}
                        serachItem={serachItem}
                        handleDoubleClickEdited={handleDoubleClickEdited}
                      />
                    </TabPanel>
                    <TabPanel>
                      <PurchasedImages
                        OrderLoading={OrderLoading}
                        viewImagePurchased={presentationViewPurchased}
                        setViewImagePurchased={setPresentationModePurchased}
                        handle={handle}
                        handleChange={handleChange}
                        ref={ref}
                        isFullScreen={isFullScreen}
                        fullscreen={fullscreen}
                        purchasedPhotos={pruchasedImages}
                        slideShowIndexPurchased={slideShowIndexPurchased}
                        serachItem={serachItem}
                        handleDoubleClickPurchased={handleDoubleClickPurchased}
                      />
                    </TabPanel>
                    <TabPanel>
                      <FavouriteImages
                        OrderLoading={OrderLoading}
                        viewImageFavorite={presentationViewFavorites}
                        setViewImageFavorite={setPresentationModeFavorites}
                        handle={handle}
                        handleChange={handleChange}
                        ref={ref}
                        isFullScreen={isFullScreen}
                        fullscreen={fullscreen}
                        favoritesImages={favoritesImages}
                        slideShowIndexFavorite={slideShowIndexFavorite}
                        serachItem={serachItem}
                        handleDoubleClickFav={handleDoubleClickFavorites}
                      />
                    </TabPanel>
                  </TabPanels>
                </CardBody>
              </Card>
            </Tabs>
          </GridItem>
        </Grid>
      </Box>
    </>
  );
}

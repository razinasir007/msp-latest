import React, { useState } from "react";
import { globalState, useGlobalState } from "../../../state/store";
import { State, useHookstate } from "@hookstate/core";
import {
  VStack,
  Box,
  Image,
  Center,
  Text,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Textarea,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { AiFillFolder } from "react-icons/ai";
import { FaStar } from "react-icons/fa";
import { Product } from "../../../state/interfaces";
import { BiSolidCommentAdd } from "react-icons/bi";
import { DeleteIcon } from "@chakra-ui/icons";
import { ProductTodoList } from "./productTodoList";

export function ProductView(props: { selectedProductId: State<string, {}> }) {
  const wrappedState = useGlobalState();
  const roomViewImagesState = wrappedState.getRoomViewImages();
  const products = wrappedState.getAllProducts();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [productState, setProductState] = useState({});
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");

  const [todoProduct, setTodoProduct] = useState({});
  // const handleRatingClick = (newRating, product) => {
  //   setRating(newRating); // Toggle rating
  //   globalState.products.set((prev) => {
  //     return prev.map((p) =>
  //       p.id === product.id ? { ...p, rating: newRating } : p
  //     );
  //   });
  // };
  const addNote = () => {
    globalState.products.set((prev) => {
      return prev.map((product) =>
        product.id === productState.id ? { ...product, note: note } : product
      );
    });
    onClose();
  };
  const handleProductClick = (product) => {
    const isProductInRoomView = roomViewImagesState.some(
      (roomViewProduct) => roomViewProduct.id === product.photo.id
    );
    if (isProductInRoomView) {
      // Remove the product from the roomView
      wrappedState.removeRoomViewImage(product.photo.id);
    } else {
      // Add the product to the roomView
      wrappedState.addImageToRoomView(
        product.photo.id,
        product.photo.base64,
        product.photo.path,
        product.photo.resizedBase64,
        product.photo.thumbnail,
        product.frame.img,
        product.matting.colorCode,
        150,
        350
      );
    }
  };
  return (
    <>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Note:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="p4" fontWeight="400" mb="8px">
              Add note
            </Text>
            <Textarea
              h="350px"
              placeholder="Add notes"
              size="lg"
              onChange={(e) => setNote(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button onClick={addNote}>Add</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {products.length === 0 ? (
        <Center paddingTop="10px" height="80%">
          <VStack spacing={0}>
            <AiFillFolder color={"#FFFFFF"} size="20px" />
            <Text color={"#FFFFFF"} fontSize="sm">
              No products finalized.
            </Text>
          </VStack>
        </Center>
      ) : (
        <Box paddingTop="10px" className="hide-scrollbar" h="100%">
          <VStack spacing={2}>
            {products.map((product: Product, index) => (
              <Box
                key={index}
                border={
                  roomViewImagesState.some(
                    (roomProduct) => roomProduct.id === product.photo.id
                  )
                    ? "4px solid #648fc4"
                    : "none"
                }
              >
                <Box
                  width="100%"
                  height="134px"
                  position="relative"
                  key={product.id}
                >
                  <Image
                    objectFit="contain"
                    src={product.photo.resizedBase64}
                    loading="lazy"
                    bg="white"
                    width="100%"
                    height="100%"
                    // onClick={() => props.selectedProductId.set(product.id)}
                    onClick={() => handleProductClick(product)}
                  />

                  <Box
                    position="absolute"
                    bottom={0}
                    p={1}
                    backgroundColor="rgba(0, 0, 0, 0.7)"
                    color="white"
                    h="60px"
                    width="100%"
                    textAlign="center"
                  >
                    <Text>
                      W:
                      {product.calibratedDimensions.width} x L:
                      {product.calibratedDimensions.height}
                    </Text>
                    <Text>
                      Frame: {product.frame.value} Matting:{" "}
                      {product.matting.value}
                    </Text>
                  </Box>
                </Box>

                <Center padding={2} bg="greys.500" w="100%">
                  <Flex>
                    <ProductTodoList
                      selectedProduct={todoProduct}
                      handleEditClick={() => setTodoProduct(product)}
                    />

                    <BiSolidCommentAdd
                      size={19}
                      style={{
                        cursor: "pointer",
                        marginLeft: "5px",
                      }}
                      onClick={() => {
                        setProductState(product), onOpen();
                      }}
                    />
                    <DeleteIcon
                      fontSize="16px"
                      style={{ cursor: "pointer" }}
                      ml="10px"
                      onClick={() => {
                        wrappedState.removeProduct(product);
                      }}
                    />
                  </Flex>
                </Center>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </>
  );
}

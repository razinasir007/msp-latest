import React from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Textarea,
  VStack,
  useDisclosure,
  Text,
  Image,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { BiDollar } from "react-icons/bi";
import { LabeledInput } from "../shared/labeledInput";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export const EditPackageModal = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleImageSelection = (image, size) => {
    const updatedPackage = {
      ...props.packagee,
      sizes: props.packagee?.sizes.map((thisSize) => {
        if (thisSize.size.id === size.size.id) {
          let isPresent = false;
          const updatedImages = thisSize.images.filter((img) => {
            if (img.id === image.id) {
              isPresent = true; // Set flag to true if image ID is present
              return false; // Remove the image from the array
            }
            return true;
          });
          if (!isPresent) {
            updatedImages.push(image); // Add the image if it's not present
          }
          return {
            ...thisSize,
            images: updatedImages,
          };
        } else {
          return thisSize;
        }
      }),
    };
    const updatedPackages = props.packages.map((pkg) => {
      if (pkg.id === updatedPackage.id) {
        return updatedPackage;
      } else return pkg;
    });
    props.setPackages(updatedPackages);
  };
  return (
    <>
      <EditIcon boxSize={"20px"} onClick={onOpen} />
      <Modal isOpen={isOpen} onClose={onClose} size='lg' isCentered={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Package</ModalHeader>
          <ModalCloseButton />

          <ModalBody className='sidebar-container-class'>
            <VStack
              spacing='8px'
              padding={"8px"}
              alignItems='flex-start'
              h='70vh'
              overflowY={"scroll"}
            >
              <Card variant='outline' style={mainCardStyle}>
                <CardHeader>
                  <Text fontWeight={"semibold"} fontSize={"h6"}>
                    {props.packagee.name}
                  </Text>
                </CardHeader>
                <>
                  <Divider width='100%' opacity={1} />
                  <CardBody padding='16px' width='100%'>
                    <VStack spacing='16px' alignItems='flex-start' width='100%'>
                      <VStack
                        spacing='8px'
                        alignItems='flex-start'
                        width='100%'
                      >
                        <Text
                          fontSize='p5'
                          fontWeight='normal'
                          marginRight={"4px"}
                        >
                          Description:
                        </Text>
                        <Textarea
                          fontSize={"sm"}
                          value={props.packagee.description}
                          onChange={(event) => {
                            const updatedPackage = {
                              ...props.packagee,
                              description: event.target.value,
                            };
                            const updatedPackages = props.packages.map(
                              (pkg) => {
                                if (pkg.id === updatedPackage.id) {
                                  return updatedPackage;
                                } else return pkg;
                              }
                            );
                            props.setPackages(updatedPackages);
                          }}
                        />
                      </VStack>
                      <VStack spacing='8px' alignItems='flex-start' w={"100%"}>
                        <Text
                          fontSize='p5'
                          fontWeight='normal'
                          marginRight={"4px"}
                        >
                          Sizes:
                        </Text>
                        <Flex w={"100%"}>
                          <Accordion allowToggle w={"100%"}>
                            {props.packagee.sizes.map((size, index) => (
                              <AccordionItem>
                                <AccordionButton>
                                  <Flex
                                    as='span'
                                    flex='1'
                                    justifyContent='space-between'
                                  >
                                    {size.size.size}
                                  </Flex>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                  <SimpleGrid columns={2} spacing='20px'>
                                    {props.presentationImages.map((image) => {
                                      const isImagePresent = size.images.some(
                                        (img) => img.id === image.id
                                      );
                                      return (
                                        <Box
                                          onClick={() => {
                                            handleImageSelection(image, size);
                                          }}
                                        >
                                          <Image
                                            border={
                                              isImagePresent
                                                ? "4px solid #648fc4"
                                                : "none"
                                            }
                                            key={image.id}
                                            maxHeight='134px'
                                            objectFit='contain'
                                            src={image.resizedBase64}
                                          />
                                        </Box>
                                      );
                                    })}
                                  </SimpleGrid>
                                </AccordionPanel>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </Flex>
                      </VStack>
                      <VStack spacing='8px' alignItems='flex-start'>
                        <LabeledInput
                          value={props.packagee.price}
                          type='number'
                          label='Price: '
                          labelSize='p5'
                          name='price'
                          onChange={(event) => {
                            const updatedPackage = {
                              ...props.packagee,
                              price: Number(event.target.value),
                            };
                            const updatedPackages = props.packages.map(
                              (pkg) => {
                                if (pkg.id === updatedPackage.id) {
                                  return updatedPackage;
                                } else return pkg;
                              }
                            );
                            props.setPackages(updatedPackages);
                          }}
                          leftIcon={<BiDollar />}
                        />
                      </VStack>
                    </VStack>
                  </CardBody>
                </>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={"8px"}>
              <Button onClick={onClose}>Save</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

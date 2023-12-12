import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
  Text,
  ModalCloseButton,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Flex,
  Box,
  Textarea,
  ModalFooter,
  Button,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import { SelectDropdown } from "../shared/selectDropdown";
import { LabeledInput } from "../shared/labeledInput";
import { BiDollar } from "react-icons/bi";
import { useQuery } from "@apollo/client";
import { GetPackageByOrg } from "../../../apollo/packageQueries";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};
interface Size {
  size: {
    id: string;
    value: string;
  };
  images: any[];
}
interface SelectedPackage {
  id: string | undefined;
  name: string;
  description: string;
  sizes: Size[];
  price: number;
}

export const SelectPackage = (props) => {
  const stateUser = useHookstate(globalState.user);
  const [packagesState, setPackagesState] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage>();

  const {
    loading: packagesDataLoading,
    error: packagesDataError,
    data: packagesData,
  } = useQuery(GetPackageByOrg, {
    variables: { orgId: stateUser.value?.organization?.id },
  });

  useEffect(() => {
    if (packagesData) {
      setPackagesState(packagesData?.package?.lookupByOrganization);
    }
  }, [packagesData]);

  const handleClose = () => {
    props.setAddPackages(false);
  };
  const handlePackageSelect = (packageId) => {
    // Find the package with the provided ID from packagesState and set it as selectedPackage
    const foundPackage = packagesState.find((ele) => ele.id === packageId);
    const updatedPackage = {
      ...foundPackage,
      sizes: foundPackage?.sizes.map((size) => {
        return {
          size: size,
          images: [],
        };
      }),
    };
    setSelectedPackage(updatedPackage);
  };

  const handleImageSelection = (image, size) => {
    const updatedPackage = {
      ...selectedPackage,
      sizes: selectedPackage?.sizes.map((thisSize) => {
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
    setSelectedPackage(updatedPackage);
  };

  return (
    <Box>
      <Modal
        isOpen={props.addPackages}
        onClose={handleClose}
        size='xl'
        isCentered={true}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a package</ModalHeader>
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
                  {packagesState ? (
                    <SelectDropdown
                      containerHeight='55px'
                      labelSize='p5'
                      placeholder='Select a package'
                      loading={packagesDataLoading}
                      value={{
                        label: selectedPackage?.name,
                        value: selectedPackage?.id,
                      }}
                      label='Select Package :'
                      options={packagesState.map((ele) => ({
                        label: ele.name,
                        value: ele.id,
                      }))}
                      onChange={(selectedValue) =>
                        handlePackageSelect(selectedValue.value)
                      }
                    />
                  ) : (
                    <>
                      <Text
                        fontSize='p5'
                        fontWeight='normal'
                        marginRight={"4px"}
                      >
                        No Package Found.
                      </Text>
                    </>
                  )}
                </CardHeader>
                {selectedPackage && (
                  <>
                    <Divider width='100%' opacity={1} />
                    <CardBody padding='16px' width='100%'>
                      <VStack
                        spacing='16px'
                        alignItems='flex-start'
                        width='100%'
                      >
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
                            value={selectedPackage?.description}
                            onChange={(event) => {
                              const updatedPackage = {
                                ...selectedPackage,
                                description: event.target.value,
                              };
                              setSelectedPackage(updatedPackage);
                            }}
                          />
                        </VStack>
                        <VStack
                          spacing='8px'
                          alignItems='flex-start'
                          w={"100%"}
                        >
                          <Text
                            fontSize='p5'
                            fontWeight='normal'
                            marginRight={"4px"}
                          >
                            Sizes:
                          </Text>
                          <Flex w={"100%"}>
                            <Accordion allowToggle w={"100%"}>
                              {selectedPackage.sizes.map((size, index) => (
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
                            value={selectedPackage.price}
                            type='number'
                            label='Price: '
                            labelSize='p5'
                            name='price'
                            onChange={(event) => {
                              const updatedPackage = {
                                ...selectedPackage,
                                price: Number(event.target.value),
                              };
                              setSelectedPackage(updatedPackage);
                            }}
                            leftIcon={<BiDollar />}
                          />
                        </VStack>
                      </VStack>
                    </CardBody>
                  </>
                )}
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={"8px"}>
              <Button variant='outline' onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  props.handleAddPackage(selectedPackage);
                  setSelectedPackage(undefined);
                }}
              >
                Add
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

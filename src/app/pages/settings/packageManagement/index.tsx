import { CheckIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  SkeletonCircle,
  SkeletonText,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useHookstate } from "@hookstate/core";
import React, { useEffect, useState } from "react";
import { globalState } from "../../../../state/store";
import { LabeledInput } from "../../../components/shared/labeledInput";
import { SelectDropdown } from "../../../components/shared/selectDropdown";
import { CreatePackage } from "../../../components/settings/packageManagement/createPackage";
import { PiPackageFill } from "react-icons/pi";
import {
  DeletePackage,
  GetPackageByOrg,
  GetPackageSizes,
  UpdatePackage,
} from "../../../../apollo/packageQueries";
import { useMutation, useQuery } from "@apollo/client";
import Swal from "sweetalert2";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};
interface Package {
  id: string;
  name: string;
  description: string;
  sizes: any;
  price: number;
}
export default function PackageManagement() {
  const stateUser = useHookstate(globalState.user);
  const [editPackage, setEditPackage] = useState<Package>();
  const [packages, setPackages] = useState<Array<Package>>();
  const [deleteLoading, setDeleteLoading] = useState("");
  const [sizeOptions, setSizeOptions] = useState<Array<Package>>();

  const {
    loading: packageSizesLoading,
    error: packageSizesError,
    data: packageSizesData,
  } = useQuery(GetPackageSizes);

  const {
    loading: packagesDataLoading,
    error: packagesDataError,
    data: packagesData,
  } = useQuery(GetPackageByOrg, {
    variables: { orgId: stateUser!.get()!.organization!.id },
  });

  const [
    deletePackage,
    {
      loading: deletePackageLoading,
      error: deletePackageError,
      data: deletePackageData,
    },
  ] = useMutation(DeletePackage, {});

  const [
    updatePackage,
    {
      loading: updatePackageLoading,
      error: updatePackageError,
      data: updatePackageData,
    },
  ] = useMutation(UpdatePackage, {});

  useEffect(() => {
    if (packagesData) {
      setPackages(packagesData?.package?.lookupByOrganization);
    }
  }, [packagesData]);

  useEffect(() => {
    if (packageSizesData) {
      setSizeOptions(packageSizesData?.packageSizes?.getPackageSizes);
    }
  }, [packageSizesData]);

  const handleDropDownChange = (packagee, option) => {
    const updatedPackage = {
      ...packagee,
      sizes: option.map((opt) => {
        return { id: opt.value, size: opt.label };
      }),
    };
    setEditPackage(updatedPackage);
  };
  const handleFieldChange = (field, packagee, value) => {
    const updatedPackage = {
      ...packagee,
      [field]: value,
    };
    setEditPackage(updatedPackage);
  };

  const handleDelete = (packagee) => {
    setDeleteLoading(packagee.id);
    deletePackage({
      variables: {
        id: packagee.id,
      },
      onCompleted: (resp) => {
        if (resp.packages.deletePackage === true) {
          const updatedPackages = packages?.filter(
            (thisPackage) => thisPackage.id !== packagee.id
          );
          setPackages(updatedPackages);
          setDeleteLoading("");
          Swal.fire({
            icon: "success",
            title: "Package deleted successfully.",
            text: "Thank you.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Could not delete package. Please try again.",
          });
        }
      },
    });
  };

  const handleUpdate = () => {
    const sizes = editPackage?.sizes.map((size) => {
      return size.id;
    });
    updatePackage({
      variables: {
        updatedBy: stateUser!.get()!.uid,
        id: editPackage!.id,
        name: editPackage!.name,
        description: editPackage!.description,
        price: Number(editPackage!.price),
        orgId: stateUser!.get()!.organization!.id,
        sizes: sizes,
      },
      onCompleted: (resp) => {
        if (resp.packages.updatePackage === true) {
          const updatedPackages = packages?.map((packagee) => {
            if (packagee.id === editPackage?.id) {
              return editPackage;
            } else return packagee;
          });
          setPackages(updatedPackages);
          setEditPackage(undefined);
          Swal.fire({
            icon: "success",
            title: "Package updated successfully.",
            text: "Thank you.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Could not update package. Please try again.",
          });
        }
      },
    });
  };
  return (
    <Box height='100%'>
      <Grid
        templateAreas={`"header"
                "content" 
                "footer"`}
        gridTemplateRows={"75px 1fr 61px"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          <HStack justifyContent='space-between'>
            <Text fontSize='h2' fontWeight='semibold' lineHeight='35px'>
              Package Management
            </Text>
            {packages && packages.length > 0 && (
              <CreatePackage
                setPackages={setPackages}
                packages={packages}
                sizeOptions={sizeOptions}
              />
            )}
          </HStack>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          {packagesDataLoading ? (
            <Box
              padding='6'
              boxShadow='lg'
              bg='greys.400'
              width='100%'
              minH='235px'
              maxH='235px'
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
          ) : (
            <VStack w={"100%"} spacing={"16px"}>
              {packages && packages.length > 0 ? (
                packages.map((packagee, index) => (
                  <Box width='100%' key={index}>
                    {packagee.id !== editPackage?.id ? (
                      <Card variant='outline' style={mainCardStyle}>
                        <CardHeader padding='16px'>
                          <HStack justifyContent='space-between'>
                            <Text
                              fontSize='h6'
                              fontWeight='semibold'
                              noOfLines={1}
                            >
                              {packagee.name}
                            </Text>
                          </HStack>
                        </CardHeader>
                        <Divider width='100%' opacity={1} />
                        <CardBody padding='16px'>
                          <VStack spacing='8px' alignItems='flex-start'>
                            <VStack spacing='8px' alignItems='flex-start'>
                              <Text
                                fontSize='p5'
                                fontWeight='semibold'
                                noOfLines={5}
                                marginRight={"4px"}
                              >
                                Description:
                              </Text>
                              <Text
                                fontSize='p5'
                                fontWeight='normal'
                                noOfLines={5}
                              >
                                {packagee.description}
                              </Text>
                            </VStack>
                            <VStack spacing='8px' alignItems='flex-start'>
                              <Text
                                fontSize='p5'
                                fontWeight='semibold'
                                noOfLines={5}
                                marginRight={"4px"}
                              >
                                Sizes:
                              </Text>
                              <Flex>
                                {packagee.sizes.map((size, index) => (
                                  <Text
                                    key={index}
                                    fontSize='p5'
                                    fontWeight='normal'
                                    noOfLines={5}
                                    marginRight={"3px"}
                                  >
                                    {index < packagee.sizes.length - 1
                                      ? `${size.size}, `
                                      : size.size}
                                  </Text>
                                ))}
                              </Flex>
                            </VStack>
                            <VStack spacing='8px' alignItems='flex-start'>
                              <Text
                                fontSize='p5'
                                fontWeight='semibold'
                                noOfLines={5}
                              >
                                Price:
                              </Text>
                              <Text
                                fontSize='p5'
                                fontWeight='normal'
                                noOfLines={5}
                              >
                                {`$ ${packagee.price}`}
                              </Text>
                            </VStack>
                          </VStack>
                        </CardBody>
                        <CardFooter>
                          <Flex gap={"8px"}>
                            {/* delete button */}
                            <IconButton
                              key={index}
                              isLoading={
                                packagee.id === deleteLoading &&
                                deletePackageLoading
                              }
                              fontSize='18px'
                              variant='unstyled'
                              aria-label='Delete Package'
                              sx={{
                                ":hover": {
                                  backgroundColor: "#EAE8E9",
                                },
                              }}
                              onClick={() => handleDelete(packagee)}
                              icon={<DeleteIcon />}
                            />
                            {/* edit button */}
                            <IconButton
                              fontSize='18px'
                              variant='unstyled'
                              aria-label='Edit Field'
                              sx={{
                                ":hover": {
                                  backgroundColor: "#EAE8E9",
                                },
                              }}
                              onClick={() => {
                                setEditPackage(packagee);
                              }}
                              icon={<EditIcon />}
                            />
                          </Flex>
                        </CardFooter>
                      </Card>
                    ) : (
                      <Card
                        marginTop='16px'
                        variant='outline'
                        style={mainCardStyle}
                      >
                        <CardHeader padding='16px'>
                          <HStack justifyContent='space-between' w='100%'>
                            <LabeledInput
                              required={true}
                              label='Name'
                              placeholder='Name...'
                              onChange={(event) => {
                                handleFieldChange(
                                  event.target.name,
                                  editPackage,
                                  event.target.value
                                );
                              }}
                              value={editPackage.name}
                              name='name'
                            />
                          </HStack>
                        </CardHeader>
                        <Divider width='100%' opacity={1} />
                        <CardBody padding='16px'>
                          <VStack spacing='8px' alignItems='flex-start'>
                            <Box w='100%'>
                              <Text fontSize={"p4"} fontWeight='normal'>
                                Description
                              </Text>
                              <Textarea
                                required={true}
                                height={`${5 * 1.49}em`} //specifying number of lines to be 5 by default
                                placeholder='Description...'
                                name='description'
                                _placeholder={{
                                  fontSize: "14px",
                                }}
                                borderRadius='4px'
                                onChange={(event) => {
                                  handleFieldChange(
                                    event.target.name,
                                    editPackage,
                                    event.target.value
                                  );
                                }}
                                value={editPackage.description}
                              />
                            </Box>
                            <VStack width='100%' alignItems={"flex-start"}>
                              <Text fontSize={"p4"} fontWeight='normal'>
                                Sizes
                              </Text>
                              <SelectDropdown
                                containerHeight='55px'
                                labelSize='p4'
                                placeholder='Sizes'
                                isClearable={false}
                                loading={packageSizesLoading}
                                isMulti={true}
                                value={editPackage.sizes.map(
                                  (size) => {
                                    return {
                                      label: size.size,
                                      value: size.id,
                                    };
                                  }
                                )}
                                options={
                                  sizeOptions &&
                                  sizeOptions.map((ele) => ({
                                    label: ele.size,
                                    value: ele.id,
                                  }))
                                }
                                onChange={(values) =>
                                  handleDropDownChange(editPackage, values)
                                }
                              />
                            </VStack>
                            <Box w='100%'>
                              <LabeledInput
                                label='Price'
                                type='number'
                                placeholder='Price...'
                                onChange={(event) => {
                                  handleFieldChange(
                                    event.target.name,
                                    editPackage,
                                    event.target.value
                                  );
                                }}
                                value={editPackage.price}
                                name='price'
                              />
                            </Box>
                          </VStack>
                        </CardBody>
                        <CardFooter>
                          <Flex gap={"8px"}>
                            {/* cancel button */}
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                // setCancel(!cancel);
                                setEditPackage(undefined);
                              }}
                            >
                              Cancel
                            </Button>
                            {/* update button */}
                            <Button
                              leftIcon={<CheckIcon />}
                              isLoading={updatePackageLoading}
                              variant='solid'
                              marginLeft='16px'
                              size='sm'
                              onClick={handleUpdate}
                            >
                              Update
                            </Button>
                          </Flex>
                        </CardFooter>
                      </Card>
                    )}
                  </Box>
                ))
              ) : (
                <Center
                  w={"100%"}
                  minH='235px'
                  flexDirection='column'
                  borderRadius='4px'
                  border={"1px dashed #8A8A8A"}
                >
                  <PiPackageFill size={"40px"} />
                  <Text fontSize='h5' fontWeight='semibold'>
                    No packages created yet
                  </Text>
                  <Text fontSize='p4' fontWeight='normal'>
                    Create new package
                  </Text>
                  <Box paddingTop='16px'>
                    <CreatePackage
                      setPackages={setPackages}
                      packages={packages}
                      sizeOptions={sizeOptions}
                    />
                  </Box>
                </Center>
              )}
            </VStack>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
}

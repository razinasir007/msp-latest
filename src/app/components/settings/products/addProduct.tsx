import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Grid,
  GridItem,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { LabeledInput } from "../../shared/labeledInput";
import { dataURLtoFile, StatusOptions } from "../../../../constants";
import { SelectDropdown } from "../../shared/selectDropdown";
import { ProductOptions } from "../../interfaces";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useQuery } from "@apollo/client";
import {
  GetProductDetailsOptionsByProdID,
  GetReservedOptions,
} from "../../../../apollo/productQueries";
import { AddIcon } from "@chakra-ui/icons";
import { EditOptionsCard } from "./editOptionsCard";
import { v4 as uuidv4 } from "uuid";
import { OptionsCard } from "./optionsCard";
import { none, useHookstate, State } from "@hookstate/core";
import { NewOptionCard } from "./newOptionCard";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
  boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
};

export function AddProduct(props: { product }) {
  const { product } = props;

  const [addOptions, setAddOptions] = useState<boolean>(false);
  const [editOptions, setEditOptions] = useState<{
    id: string | null;
  }>({
    id: null,
  });

  const optionData: ProductOptions = {
    id: uuidv4(),
    name: "",
    sortingIndex: 0,
    fields: [
      {
        id: uuidv4(),
        sortingIndex: 0,
        value: "",
        price: 0,
        cost: 0,
      },
    ],
  };

  const reservedOptions: State<ProductOptions[]> = useHookstate(
    [] as ProductOptions[]
  );

  const additionalOptions: State<ProductOptions[]> = useHookstate(
    [] as ProductOptions[]
  );

  const {
    loading: resOptionsLoading,
    error: resOptionsError,
    data: resOptionsData,
  } = useQuery(GetReservedOptions);

  const {
    loading: prodResOptionsLoading,
    error: prodResOptionsError,
    data: prodResOptionsData,
  } = useQuery(GetProductDetailsOptionsByProdID, {
    variables: { prodID: product.id.value },
  });

  const populateProductDetails = (options) => {
    let tempOptions: any = [];

    return options.map((option) => {
      let tempFields: any = [];

      switch (option.name) {
        case "Frame":
          option.fields.map((field) => {
            tempFields[field.sortingIndex] = {
              id: uuidv4(),
              sortingIndex: field.sortingIndex,
              value: field.value,
              price: field.price,
              cost: field.cost,
              image: {
                base: field.image,
                file: dataURLtoFile(
                  `data:image/png;base64,${field.image}`,
                  `frame-${field.value}`
                ),
              },
            };
          });
          break;
        case "Matting":
          option.fields.map((field) => {
            tempFields[field.sortingIndex] = {
              id: uuidv4(),
              sortingIndex: field.sortingIndex,
              value: field.value,
              price: field.price,
              cost: field.cost,
              colorCode: field.colorCode,
            };
          });
          break;
        default:
          option.fields.map((field) => {
            tempFields[field.sortingIndex] = {
              id: uuidv4(),
              sortingIndex: field.sortingIndex,
              value: field.value,
              price: field.price,
              cost: field.cost,
            };
          });
      }

      return (tempOptions[option.sortingIndex] = {
        id: uuidv4(),
        name: option.name,
        sortingIndex: option.sortingIndex,
        fields: tempFields,
      });
    });
  };

  // for a new product, add the status property
  // for existing products, do nothing
  useEffect(() => {
    if (!product.status.value) {
      product.status.set(StatusOptions[0]);
    }
  }, []);

  useEffect(() => {
    // if product variants already exist, get them and populate those
    if (product.reservedOptions.value && prodResOptionsData !== undefined) {
      reservedOptions.set(
        populateProductDetails(
          prodResOptionsData.productDetails.lookupProductDetail.reservedOptions
        )
      );
      // check if product regular options exist, get them and populate those
      if (
        prodResOptionsData.productDetails.lookupProductDetail.regularOptions
          .length > 0
      ) {
        additionalOptions.set(
          prodResOptionsData.productDetails.lookupProductDetail.regularOptions
        );
        setAddOptions(!addOptions);
      }
    } else if (
      product.reservedOptions.value &&
      !prodResOptionsLoading &&
      resOptionsData !== undefined
    ) {
      reservedOptions.set(
        populateProductDetails(
          resOptionsData.productDetails.getProductDetailReservedOptions
        )
      );
    } else {
      reservedOptions.set([]);
    }
  }, [resOptionsData, prodResOptionsData]);

  useEffect(() => {
    if (reservedOptions.length > 0) {
      product.reservedOptions.set(reservedOptions);
    } else {
      product.reservedOptions.set([]);
    }
  }, [reservedOptions]);

  useEffect(() => {
    if (additionalOptions.length > 0) {
      product.regularOptions.set(additionalOptions);
    } else {
      product.regularOptions.set(none);
    }
  }, [additionalOptions]);

  // This runs whenever user removes additional options after adding them.
  // Empties the state and removes the property from the product object.
  useEffect(() => {
    if (addOptions === false) {
      additionalOptions.set([]);
      product.regularOptions.set(none);
    }
  }, [addOptions]);

  // Run this whenever there is a change in reserved or additional options
  // and updates the options array which is used for the API call
  useEffect(() => {
    const mergedOptions = [
      ...reservedOptions.get(),
      ...additionalOptions.get(),
    ];
    const optionsToSet =
      mergedOptions.length > 0
        ? mergedOptions
        : reservedOptions.length > 0
        ? reservedOptions.get()
        : additionalOptions.get();

    product.options.set(() => [...optionsToSet]);
  }, [reservedOptions, additionalOptions]);

  const resDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (result.type === "DEFAULT") {
      reservedOptions.set((previousState) => {
        const [removed] = previousState.splice(result.source.index, 1);
        previousState.splice(result.destination.index, 0, removed);
        previousState.map((option, index) => {
          option.sortingIndex = index;
        });
        return previousState;
      });
      product.set((oriState) => {
        oriState.reservedOptions = reservedOptions;
        return oriState;
      });
    }
  };

  const addDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (result.type === "DEFAULT") {
      additionalOptions.set((previousState) => {
        const [removed] = previousState.splice(result.source.index, 1);
        previousState.splice(result.destination.index, 0, removed);
        previousState.map((option, index) => {
          option.sortingIndex = index;
        });
        return previousState;
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    product.set((oriState) => {
      oriState[name] = value;
      return oriState;
    });
  };

  return (
    <Grid h='100%' templateColumns='repeat(3, 1fr)' gap='16px'>
      <GridItem colSpan={2}>
        <VStack spacing='16px'>
          {/* Title Card*/}
          <Card variant='outline' style={mainCardStyle}>
            <CardBody padding='8px'>
              <Box width='50%'>
                <LabeledInput
                  label='Title'
                  name='title'
                  labelSize='p5'
                  placeholder='Add Item Title'
                  type='text'
                  onChange={handleChange}
                  value={product.title.value}
                />
              </Box>
              <Text fontSize={"p5"} fontWeight='normal' lineHeight='25px'>
                Description
              </Text>
              <Textarea
                placeholder='Description...'
                name='description'
                _placeholder={{
                  fontSize: "14px",
                }}
                borderRadius='4px'
                onChange={handleChange}
                value={product.description.value}
              />
            </CardBody>
          </Card>
          {/* Title Card*/}

          {/* Reserved Options Card*/}
          <Card variant='outline' style={mainCardStyle}>
            <CardHeader padding='8px'>
              <Text fontSize='h6' fontWeight='semibold'>
                Reserved Options
              </Text>
            </CardHeader>

            <CardBody padding='8px'>
              <VStack spacing='16px' alignItems='flex-start'>
                {reservedOptions.get().length > 0 ? (
                  <DragDropContext onDragEnd={resDragEnd}>
                    <Droppable droppableId='droppable'>
                      {(provided, snapshot) => (
                        <Box
                          width='100%'
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {/* {sortedReservedOptions.map((option, index) => ( */}
                          {reservedOptions.get().map((option, index) => (
                            <Draggable
                              key={index}
                              draggableId={String(index + 22)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Box
                                  width='100%'
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  // {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    boxShadow: snapshot.isDragging
                                      ? "0 0 .4rem #666"
                                      : "none",
                                    background: snapshot.isDragging
                                      ? "rgba(255, 255, 255, 0.85)"
                                      : "none",
                                  }}
                                >
                                  {editOptions &&
                                  editOptions.id === option.id ? (
                                    <EditOptionsCard
                                      option={option}
                                      setEditOptions={setEditOptions}
                                      parentDragHandle={
                                        provided.dragHandleProps
                                      }
                                      optionsState={reservedOptions}
                                    />
                                  ) : (
                                    <OptionsCard
                                      dragHandle={provided.dragHandleProps}
                                      option={option}
                                      setEditOptions={setEditOptions}
                                    />
                                  )}
                                </Box>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <Text fontSize='p6' fontWeight='normal'>
                    Loading reserved options...
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
          {/* Reserved Options Card*/}

          {/* Additional Options Card*/}
          {addOptions && (
            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h6' fontWeight='semibold'>
                  Additional Options
                </Text>
              </CardHeader>

              <CardBody padding='8px'>
                <VStack spacing='16px' alignItems='flex-start'>
                  <Checkbox
                    colorScheme={"gray"}
                    onChange={(event) => {
                      setAddOptions(event.target.checked);
                    }}
                    defaultChecked={addOptions}
                  >
                    <Text fontSize='p6' fontWeight='normal'>
                      This product has different options like size, color,
                      border, format
                    </Text>
                  </Checkbox>

                  {additionalOptions.length > 0 ? (
                    <DragDropContext onDragEnd={addDragEnd}>
                      <Droppable droppableId='droppable'>
                        {(provided, snapshot) => (
                          <Box
                            width='100%'
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {additionalOptions.get().map((option, index) => (
                              <Draggable
                                key={index}
                                draggableId={String(index + 22)}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <Box
                                    width='100%'
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    // {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      boxShadow: snapshot.isDragging
                                        ? "0 0 .4rem #666"
                                        : "none",
                                      background: snapshot.isDragging
                                        ? "rgba(255, 255, 255, 0.85)"
                                        : "none",
                                    }}
                                  >
                                    {editOptions &&
                                    editOptions.id === option.id ? (
                                      <NewOptionCard
                                        option={option}
                                        optionsState={additionalOptions}
                                        setEditOptions={setEditOptions}
                                        parentDragHandle={
                                          provided.dragHandleProps
                                        }
                                      />
                                    ) : (
                                      <OptionsCard
                                        option={option}
                                        setEditOptions={setEditOptions}
                                        dragHandle={provided.dragHandleProps}
                                      />
                                    )}
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    <></>
                  )}
                  <Button
                    leftIcon={<AddIcon />}
                    size='sm'
                    onClick={() => {
                      additionalOptions.set((oriState) => {
                        oriState.push(optionData);
                        return oriState;
                      });
                    }}
                  >
                    Add More Options
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
          {/* Additional Options Card*/}

          {/* Add New Options Button*/}
          {!addOptions && (
            <Button
              leftIcon={<AddIcon />}
              size='sm'
              onClick={() => {
                setAddOptions(!addOptions);
                additionalOptions.set((oriState) => {
                  oriState.push(optionData);
                  return oriState;
                });
              }}
            >
              Add Additional Options
            </Button>
          )}
        </VStack>
      </GridItem>

      <GridItem colSpan={1}>
        <VStack spacing='16px'>
          {/* Product Status Card*/}
          <Card variant='outline' style={mainCardStyle}>
            <CardHeader padding='8px'>
              <Text fontSize='h6' fontWeight='semibold'>
                Product Status
              </Text>
            </CardHeader>
            <CardBody padding='8px'>
              <SelectDropdown
                isClearable={false}
                options={StatusOptions}
                placeholder='Status'
                containerHeight='33px'
                // containerWidth='200px'
                defaultValue={StatusOptions[0]}
                value={product.status.value}
                onChange={(selection) => {
                  product.set((oriState) => {
                    oriState.status = selection;
                    return oriState;
                  });
                }}
              />
            </CardBody>
          </Card>
          {/* Product Status Card*/}

          {/* Pricing Card*/}
          <Card variant='outline' style={mainCardStyle}>
            <CardHeader padding='8px'>
              <Text fontSize='h6' fontWeight='semibold'>
                Flat Pricing
              </Text>
            </CardHeader>
            <CardBody padding='8px'>
              <VStack spacing='4px' alignItems='flex-start'>
                <LabeledInput
                  name='flatPrice'
                  onChange={handleChange}
                  label='Flat Price'
                  labelSize='h7'
                  type='number'
                  value={product.flatPrice.value ? product.flatPrice.value : 0}
                />
                <LabeledInput
                  name='flatCost'
                  onChange={handleChange}
                  label='Cost per item'
                  labelSize='h7'
                  type='number'
                  value={product.flatCost.value ? product.flatCost.value : 0}
                />
              </VStack>
            </CardBody>
          </Card>
          {/* Pricing Card*/}
        </VStack>
      </GridItem>
    </Grid>
  );
}

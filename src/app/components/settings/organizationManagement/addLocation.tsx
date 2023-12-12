/*es-lint disable*/
import React, { useContext, useEffect, useState } from "react";
import { Box, IconButton, HStack, Flex } from "@chakra-ui/react";
import { AddIcon, DeleteIcon, CheckIcon, EditIcon } from "@chakra-ui/icons";
import { LabeledInput } from "../../shared/labeledInput";
import { AddressInput } from "../../shared/addressInput";
import {
  BindOrganizationLocations,
  CreateLocation,
  DeleteLocation,
  UpdateLocation,
} from "../../../../apollo/helperQueries";
import { useMutation } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";
import { OrgDetails, LocationDetails } from "../../interfaces";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import {
  CreateLocationSalesTax,
  DeleteLocationSalesTax,
  UpdateLocationSalesTax,
} from "../../../../apollo/organizationQueries";
import { UserPermissions } from "../../../routes/permissionGuard";

export function AddLocations(props: {
  orgDetails: OrgDetails;
  loading: boolean;
  salesTaxLoading: boolean;
}) {
  const { userPermissions } = useContext(UserPermissions);
  const user = useHookstate(globalState.user);
  const [rows, setRows] = useState<LocationDetails[]>(
    props.orgDetails.locations ? props.orgDetails.locations : []
  );
  const [loading, setLoading] = useState<String>();

  useEffect(() => {
    if (props.orgDetails.locations?.length) {
      setRows(
        props.orgDetails.locations.filter(
          (location) => location.isPrimary !== true
        )
      );
    } else {
      setRows([]);
    }
  }, [props.orgDetails]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: "",
        email: "",
        phoneNumber: "",
        isDisabled: false,
        address: "",
        location: {
          label: "",
          value: { description: "" },
        },
        parsedLocation: {},
        salesTax: "0",
      },
    ]);
  };

  //DELETE A SINGLE LOCATION ROW FROM UI ON DELETE
  const deleteRow = (index) => {
    setRows(
      rows.filter((location, ind) => {
        return ind !== index;
      })
    );
  };

  //creating sales tax
  const [
    CreateSalesTax,
    {
      loading: createSalesTaxLoading,
      error: createSalesTaxgError,
      data: createSalesTaxData,
    },
  ] = useMutation(CreateLocationSalesTax, {});

  const [
    UpdateSalesTax,
    {
      loading: UpdateSalesTaxLoading,
      error: UpdateSalesTaxgError,
      data: UpdateSalesTaxData,
    },
  ] = useMutation(UpdateLocationSalesTax, {});

  const [
    DeleteSalesTax,
    {
      loading: DeleteSalesTaxLoading,
      error: DeleteSalesTaxgError,
      data: DeleteSalesTaxData,
    },
  ] = useMutation(DeleteLocationSalesTax, {});

  const [
    createLocation,
    {
      loading: createLocationLoading,
      error: createLocationgError,
      data: createLocationData,
    },
  ] = useMutation(CreateLocation, {});

  const [
    updateLocation,
    {
      loading: updateLocationLoading,
      error: updateLocationgError,
      data: updateLocationData,
    },
  ] = useMutation(UpdateLocation, {});

  const [
    bindOrganizationLocations,
    {
      loading: bindLocationLoading,
      error: bindLocationgError,
      data: bindLocationData,
    },
  ] = useMutation(BindOrganizationLocations, {});

  const [
    deleteLocation,
    {
      loading: deleteLocationLoading,
      error: deleteLocationgError,
      data: deleteLocationData,
    },
  ] = useMutation(DeleteLocation, {});

  function handleLocationChange(row, location1, parsedLocation1) {
    row.address = location1.label;
    row.parsedLocation = parsedLocation1;
    row.location = location1;
    setRows([...rows]);
  }

  return (
    <>
      <Box width='100%'>
        {rows.map((row, index) => (
          <HStack width='100%' spacing='24px' paddingTop='12px' key={index}>
            <AddressInput
              label='Address'
              placeholder='Address...'
              name='address'
              loading={false}
              value={{
                label: row.address,
                value: { description: row.address },
              }}
              defaultValue={""}
              isDisabled={
                row.isDisabled ||
                (userPermissions.edit
                  ? false
                  : userPermissions.fullAccess
                  ? false
                  : true)
              }
              handleLocationChange={handleLocationChange.bind(this, row)}
            />
            <LabeledInput
              label='Email'
              placeholder='Email...'
              onChange={(event) => {
                row.email = event.target.value;
                setRows([...rows]);
              }}
              value={row.email}
              loading={props.loading}
              name='email'
              isReadOnly={
                row.isDisabled ||
                (userPermissions.edit
                  ? false
                  : userPermissions.fullAccess
                  ? false
                  : true)
              }
            />
            <LabeledInput
              label='Phone Number'
              placeholder='Phone Number...'
              onChange={(event) => {
                row.phoneNumber = event.target.value;
                setRows([...rows]);
              }}
              value={row.phoneNumber}
              loading={props.loading}
              name='number'
              isReadOnly={
                row.isDisabled ||
                (userPermissions.edit
                  ? false
                  : userPermissions.fullAccess
                  ? false
                  : true)
              }
            />

            <LabeledInput
              label='Sales Tax'
              placeholder='Sales Tax...'
              onChange={(event) => {
                row.salesTax = event.target.value;
                setRows([...rows]);
              }}
              value={row.salesTax}
              isReadOnly={
                row.isDisabled ||
                (userPermissions.edit
                  ? false
                  : userPermissions.fullAccess
                  ? false
                  : true)
              }
              loading={props.salesTaxLoading}
            />
            <Flex>
              <IconButton
                isLoading={
                  row.id === loading &&
                  (updateLocationLoading || bindLocationLoading)
                }
                onClick={() => {
                  row.isDisabled = !row.isDisabled;
                  setLoading(row.id);
                }}
                isDisabled={
                  userPermissions.fullAccess || userPermissions.edit
                    ? false
                    : true
                }
                fontSize='18px'
                variant='unstyled'
                aria-label='Save'
                icon={
                  !row.isDisabled ? (
                    <CheckIcon
                      onClick={() => {
                        setRows([...rows]);
                        if (row.id) {
                          updateLocation({
                            variables: {
                              updatedBy: user!.value?.uid,
                              location: {
                                id: row.id,
                                name: props.orgDetails.orgName,
                                email: row.email,
                                phoneNumber: row.phoneNumber,
                                address: row.location?.label,
                                countryName: row.parsedLocation?.countryName,
                                administrativeArea:
                                  row.parsedLocation?.administrativeArea,
                                administrativeAreaLevel2:
                                  row.parsedLocation?.administrativeAreaLevel2,
                                placeName: row.parsedLocation?.placeName,
                                sublocality: row.parsedLocation?.sublocality,
                                thoroughfareName:
                                  row.parsedLocation?.thoroughfareName,
                                thoroughfareNumber: Number(
                                  row.parsedLocation?.thoroughfareNumber
                                ),
                                subUnitDesignator:
                                  row.parsedLocation?.subUnitDesignator,
                                subUnitIdentifier:
                                  row.parsedLocation?.subUnitIdentifier,
                                postalCode: row.parsedLocation?.postalCode,
                              },
                            },
                            onCompleted: () => {
                              UpdateSalesTax({
                                variables: {
                                  updatedBy: user!.value?.uid,
                                  locSalesTax: {
                                    locId: row.id,
                                    salesTaxPercentage: parseFloat(
                                      row.salesTax
                                    ),
                                  },
                                },
                              });
                            },
                          });
                        } else {
                          let locID = uuidv4();
                          row.id = locID;
                          setRows([...rows]);
                          createLocation({
                            variables: {
                              createdBy: user!.value?.uid,
                              location: {
                                id: locID,
                                name: props.orgDetails.orgName,
                                email: row.email,
                                phoneNumber: row.phoneNumber,
                                address: row.location?.label,
                                countryName: row.parsedLocation?.countryName,
                                administrativeArea:
                                  row.parsedLocation?.administrativeArea,
                                administrativeAreaLevel2:
                                  row.parsedLocation?.administrativeAreaLevel2,
                                placeName: row.parsedLocation?.placeName,
                                sublocality: row.parsedLocation?.sublocality,
                                thoroughfareName:
                                  row.parsedLocation?.thoroughfareName,
                                thoroughfareNumber: Number(
                                  row.parsedLocation?.thoroughfareNumber
                                ),
                                subUnitDesignator:
                                  row.parsedLocation?.subUnitDesignator,
                                subUnitIdentifier:
                                  row.parsedLocation?.subUnitIdentifier,
                                postalCode: row.parsedLocation?.postalCode,
                              },
                            },
                            onCompleted: () => {
                              CreateSalesTax({
                                variables: {
                                  createdBy: user!.value?.uid,
                                  locSalesTax: {
                                    locId: locID,
                                    salesTaxPercentage: parseFloat(
                                      row.salesTax
                                    ),
                                  },
                                },
                              });
                            },
                          });

                          bindOrganizationLocations({
                            variables: {
                              createdBy: user!.value?.uid,
                              organizationLocation: {
                                locId: locID,
                                orgId: props.orgDetails.orgID,
                              },
                            },
                          });
                        }
                      }}
                    />
                  ) : (
                    <EditIcon
                      onClick={() => {
                        setRows([...rows]);
                      }}
                    />
                  )
                }
              />
              <IconButton
                isLoading={row.id === loading && deleteLocationLoading}
                fontSize='18px'
                variant='unstyled'
                aria-label='Delete'
                isDisabled={
                  userPermissions.fullAccess || userPermissions.delete
                    ? false
                    : true
                }
                onClick={() => {
                  setLoading(row.id);
                  row.id && row.id.length > 0
                    ? row.id &&
                      deleteLocation({
                        variables: {
                          id: row.id,
                        },
                        onCompleted: () => {
                          DeleteSalesTax({
                            variables: {
                              locId: row.id,
                            },
                          });
                        },
                      }).then(() => {
                        deleteRow(index);
                      })
                    : deleteRow(index);
                }}
                icon={<DeleteIcon />}
              />
            </Flex>
          </HStack>
        ))}
      </Box>
      <Box width='100%' py='16px'>
        <IconButton
          sx={{
            ":hover": {
              backgroundColor: "transparent",
            },
          }}
          variant='ghost'
          height='fit-content'
          aria-label='Add location'
          icon={<AddIcon />}
          isDisabled={
            userPermissions.fullAccess || userPermissions.create ? false : true
          }
          onClick={addRow}
        />
      </Box>
    </>
  );
}

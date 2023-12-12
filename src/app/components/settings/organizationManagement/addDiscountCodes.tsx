import { AddIcon, CheckIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, HStack, IconButton, VStack, Text } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { MdDiscount } from "react-icons/md";
import { DiscountCodeField } from "../../interfaces";
import { LabeledInput } from "../../shared/labeledInput";
import { SelectDropdown } from "../../shared/selectDropdown";
import { v4 as uuidv4 } from "uuid";
import { useMutation, useQuery } from "@apollo/client";
import {
  CreateOrgDiscountCodes,
  DeleteOrgDiscountCodes,
  GetOrgDiscountCodes,
  UpdateOrgDiscountCodes,
} from "../../../../apollo/organizationQueries";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { UserPermissions } from "../../../routes/permissionGuard";

export const AddDiscountCodes = () => {
  const { userPermissions } = useContext(UserPermissions);
  const user = useHookstate(globalState.user);
  const [loadingId, setLoadingId] = useState("");
  const {
    loading: discountCodeLoading,
    error: discountCodeError,
    data: discountCodeData,
    refetch: refetchDiscountCodes,
  } = useQuery(GetOrgDiscountCodes, {
    variables: { orgId: user!.value?.organization?.id },
  });
  const [discountCodeFields, setDiscountCodeFields] = useState<
    DiscountCodeField[]
  >([
    {
      id: "",
      discountValueType: "",
      discountCodeText: "",
      discountValue: 0,
    },
  ]);
  //create discount codes

  const [
    CreateDiscountCode,
    {
      loading: createDiscountCodeLoading,
      error: createDiscountCodeError,
      data: createDiscountCodeData,
    },
  ] = useMutation(CreateOrgDiscountCodes);

  //Delete discount code
  const [
    DeleteDiscountCode,
    {
      loading: deleteDiscountLoading,
      error: deleteDiscountError,
      data: deleteDiscountData,
    },
  ] = useMutation(DeleteOrgDiscountCodes, {});

  //Update discount code
  const [
    UpdateDiscountCode,
    {
      loading: updateDiscountCodeLoading,
      error: updateDiscountCodeError,
      data: updateDiscountCodeData,
    },
  ] = useMutation(UpdateOrgDiscountCodes, {});

  const disocuntTypeOptions = [
    {
      label: "ABSOLUTE",
      value: "ABSOLUTE",
    },
    {
      label: "PERCENTAGE",
      value: "PERCENTAGE",
    },
  ];
  useEffect(() => {
    if (discountCodeData) {
      const formattedData =
        discountCodeData?.organizationDiscounts?.lookupByOrganization.map(
          (dataItem) => ({
            id: dataItem.id,
            discountValueType: dataItem.discountValueType,
            discountCodeText: dataItem.discountCodeText,
            discountValue: parseFloat(dataItem.discountValue),
          })
        );

      setDiscountCodeFields(formattedData);
    }
  }, [discountCodeData]);

  const addDiscountCodeField = () => {
    setDiscountCodeFields([
      ...discountCodeFields,
      {
        id: "",
        discountValueType: "",
        discountCodeText: "",
        discountValue: 0,
      },
    ]);
  };
  return (
    <>
      <VStack w='100%' mt='15px' spacing={1}>
        {discountCodeFields.map((ele, index) => {
          return (
            <HStack w='100%' mt='20px' key={ele.id}>
              <LabeledInput
              isDisabled={
                userPermissions.fullAccess ||
                userPermissions.edit
                  ? false
                  : true
              }
                type='text'
                leftIcon={<MdDiscount />}
                label='Discount Code'
                loading={discountCodeLoading}
                placeholder='Enter discount code...'
                value={ele.discountCodeText}
                name='discountCode'
                onChange={(event) => {
                  ele.discountCodeText = event.target.value;
                  setDiscountCodeFields([...discountCodeFields]);
                }}
              />
              <LabeledInput
              isDisabled={
                userPermissions.fullAccess ||
                userPermissions.edit
                  ? false
                  : true
              }
                type='number'
                label='Discount Code Value'
                loading={discountCodeLoading}
                leftIcon={<MdDiscount />}
                placeholder='Enter discount code value...'
                value={ele.discountValue}
                name='discountCodeValue'
                onChange={(event) => {
                  ele.discountValue = parseFloat(event.target.value);
                  setDiscountCodeFields([...discountCodeFields]);
                }}
              />
              <SelectDropdown
              isDisabled={
                userPermissions.fullAccess ||
                userPermissions.edit
                  ? false
                  : true
              }
                labelSize='p4'
                placeholder='Type'
                loading={discountCodeLoading}
                value={{
                  label: ele.discountValueType,
                  value: ele.discountValueType,
                }}
                label='Type'
                options={disocuntTypeOptions.map((ele) => ({
                  label: ele.label,
                  value: ele.value,
                }))}
                onChange={(value) => {
                  ele.discountValueType = value.value;
                  setDiscountCodeFields([...discountCodeFields]);
                }}
              />
              <IconButton
                sx={{
                  ":hover": {
                    backgroundColor: "transparent",
                  },
                }}
                variant='ghost'
                height='fit-content'
                aria-label='Add Discount'
                icon={<CheckIcon />}
                isDisabled={
                  userPermissions.fullAccess ||
                  userPermissions.edit
                    ? false
                    : true
                }
                onClick={() => {
                  setLoadingId(ele.id);
                  if (!ele.id) {
                    setDiscountCodeFields([...discountCodeFields]);
                    let discountId = uuidv4();
                    ele.id = discountId;
                    CreateDiscountCode({
                      variables: {
                        createdBy: user!.value?.uid,
                        orgId: user.value?.organization?.id,
                        organizationDiscount: {
                          id: discountId,
                          discountCodeText: ele.discountCodeText,
                          discountValue: ele.discountValue,
                          discountValueType: ele.discountValueType,
                        },
                      },
                      onCompleted: (res) => {
                        refetchDiscountCodes();
                      },
                    });
                  } else {
                    setDiscountCodeFields([...discountCodeFields]);
                    UpdateDiscountCode({
                      variables: {
                        updatedBy: user!.value?.uid,
                        organizationDiscount: {
                          id: ele.id,
                          discountCodeText: ele.discountCodeText,
                          discountValue: ele.discountValue,
                          discountValueType: ele.discountValueType,
                        },
                      },
                      onCompleted: (res) => {
                        refetchDiscountCodes();
                      },
                    });
                  }
                }}
              />
              <IconButton
                _hover={{ backgroundColor: "transparent" }}
                fontSize='18px'
                variant='ghost'
                height='fit-content'
                aria-label='Delete DiscountCode'
                isDisabled={
                  userPermissions.fullAccess ||
                  userPermissions.delete
                    ? false
                    : true
                }
                icon={<DeleteIcon />}
                onClick={() => {
                  const updatedDiscountField = discountCodeFields.filter(
                    (_, currentIndex) => currentIndex !== index
                  );
                  setDiscountCodeFields(updatedDiscountField);
                  DeleteDiscountCode({
                    variables: {
                      id: ele.id,
                    },
                  });
                }}
              />
            </HStack>
          );
        })}
      </VStack>
      <HStack width='100%' py='16px'>
        <IconButton
          sx={{
            ":hover": {
              backgroundColor: "transparent",
            },
          }}
          isDisabled={
            userPermissions.fullAccess ||
            userPermissions.create
              ? false
              : true
          }
          variant='ghost'
          height='fit-content'
          aria-label='Add Fields'
          icon={<AddIcon />}
          onClick={addDiscountCodeField}
        />
        {discountCodeFields.length === 0 && (
          <Text fontSize='p5' fontWeight='semibold'>
            Add Discount Codes
          </Text>
        )}
      </HStack>
    </>
  );
};

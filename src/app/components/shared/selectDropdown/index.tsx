import React from "react";
import { Box, FormControl, FormLabel, Skeleton, Text } from "@chakra-ui/react";
import { Select } from "chakra-react-select";

export const SelectDropdown = (props: {
  containerHeight?: string;
  containerWidth?: string;
  label?: string;
  labelSize?: string;
  placeholder?: string;
  placeholderSize?: string;
  variant?: string;
  loading?: boolean;
  name?: string;
  options?: any;
  onChange?: any;
  isMulti?: boolean;
  value?: any;
  defaultValue?: any;
  isClearable?: boolean;
  isDisabled?: boolean;
}) => {
  const handleDropdownChange = (selectedOption) => {
    props.onChange(selectedOption);
  };

  return (
    <Box
      height={props.containerHeight ? props.containerHeight : "65px"}
      width={props.containerWidth ? props.containerWidth : "inherit"}
    >
      <FormControl>
        <FormLabel>
          <Text
            fontSize={props.labelSize ? props.labelSize : "p4"}
            fontWeight='normal'
            lineHeight='25px'
          >
            {props.label}
          </Text>
        </FormLabel>
        <Skeleton
          height='2rem'
          isLoaded={!props.loading}
          startColor='greys.100'
          endColor='greys.400'
        >
          <Select
            isDisabled={props.isDisabled}
            defaultValue={props.defaultValue}
            isClearable={props.isClearable}
            size='sm'
            value={props.value}
            placeholder={props.placeholder}
            variant={props.variant}
            isMulti={props.isMulti}
            focusBorderColor={"greys.600"}
            options={props.options}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
            selectedOptionStyle='check'
            chakraStyles={{
              dropdownIndicator: (provided) => ({
                ...provided,
                bg: "transparent",
                px: 2,
                cursor: "inherit",
              }),
              indicatorSeparator: (provided) => ({
                ...provided,
                display: "none",
              }),
              control: (provided) => ({
                ...provided,
                borderRadius: "4px",
              }),
            }}
            onChange={handleDropdownChange}
          />
        </Skeleton>
      </FormControl>
    </Box>
  );
};

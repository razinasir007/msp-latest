import React from "react";
import { Box, FormControl, FormLabel, Skeleton, Text } from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { ICellRendererParams } from "ag-grid-community";

interface CustomProps extends ICellRendererParams {
  containerHeight?: string;
  containerWidth?: string;
  controlWidth?: number;
  label?: string;
  labelSize?: string;
  placeholder?: string;
  placeholderSize?: string;
  variant?: string;
  loading?: boolean;
  name?: string;
  options?: any;
  setValue?: any;
  updateBackend?: any;
}

export const TableDropdown = (props: CustomProps) => {
  const id = props.data.id;

  const handleDropdownChange = (selectedOption) => {
    props.setValue(selectedOption);
    props.updateBackend(id, selectedOption);
  };

  return (
    <Box
      height={props.containerHeight ? props.containerHeight : "65px"}
      width={props.containerWidth ? props.containerWidth : "160px"}
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
            defaultValue={props.value}
            // isClearable={true}
            // value={props.value}
            size='sm'
            placeholder={props.placeholder}
            variant={props.variant}
            focusBorderColor={"greys.600"}
            options={props.options}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
            selectedOptionStyle='check'
            chakraStyles={{
              menu: (provided) => ({
                ...provided,
                width: "inherit",
              }),
              menuList: (provided) => ({
                ...provided,
                left: "-24px",
                top: "-10px",
                width: "270px",
              }),
              dropdownIndicator: (provided) => ({
                ...provided,
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
                width: props.controlWidth ? `${props.controlWidth}px` : "120px",
              }),
            }}
            onChange={handleDropdownChange}
          />
        </Skeleton>
      </FormControl>
    </Box>
  );
};

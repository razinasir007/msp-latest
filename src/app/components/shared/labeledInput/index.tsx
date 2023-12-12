import React from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Skeleton,
  Text,
} from "@chakra-ui/react";

export const LabeledInput = (props: {
  containerHeight?: string;
  label?: string;
  labelSize?: string;
  value?: string | number;
  defaultValue?: string | number;
  ref?: any;
  placeholder?: string;
  borderRadius?: string;
  id?: string;
  placeholderSize?: string;
  type?: string;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  required?: boolean;
  width?: string;
  loading?: boolean;
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}) => {
  return (
    <Box
      height={props.containerHeight ? props.containerHeight : "65px"}
      width='inherit'
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
          <InputGroup>
            {props.leftIcon ? (
              <InputLeftElement height='100%' children={props.leftIcon} />
            ) : (
              ""
            )}
            <Input
              size='sm'
              focusBorderColor={props.isReadOnly ? "greys.400" : "greys.600"}
              // borderRadius='base'
              borderRadius={props.borderRadius}
              placeholder={props.placeholder}
              type={props.type}
              defaultValue={props.defaultValue}
              value={props.value}
              required={props.required}
              onBlur={props.onBlur}
              id={props.id}
              width={props.width}
              isReadOnly={props.isReadOnly}
              isDisabled={props.isDisabled}
              ref={props.ref}
              bg={props.isReadOnly ? "greys.400" : ""}
              color={props.isReadOnly ? "greys.700" : ""}
              name={props.name}
              onChange={props.onChange}
              _placeholder={{
                fontSize: props.placeholderSize ? props.placeholderSize : "",
              }}
            />
            {props.rightIcon ? (
              <InputRightElement height='100%' children={props.rightIcon} />
            ) : (
              ""
            )}
          </InputGroup>
        </Skeleton>
      </FormControl>
    </Box>
  );
};

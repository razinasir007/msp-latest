import React from "react";
import { Box, FormControl, FormLabel, Skeleton, Text } from "@chakra-ui/react";
import GooglePlacesAutocomplete, {
  geocodeByPlaceId,
} from "react-google-places-autocomplete";
import { Location } from "../../interfaces";
import { appConfig } from "../../../../config";

const customStyles = {
  container: (provided) => ({
    ...provided,
    width: "100%",
    borderRadius: "4px",
  }),
  // input: (provided) => ({
  //   ...provided,
  //   fontSize: "14px",
  //   fontWeight: "bold",
  // }),
  control: (provided, state) => ({
    ...provided,
    borderColor: "inherit",
    minHeight: "2rem !important",
    maxHeight: "2rem !important",
    boxShadow: state.isFocused ? "0 0 0 1px #8A8884" : 0,
    ":hover": {
      borderColor: state.isFocused ? "#8A8884" : "#D6D4D0",
    },
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: "2rem !important",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    padding: "4px",
  }),

  option: (provided) => ({
    ...provided,
    ":hover": {
      backgroundColor: "#D6D4D0",
    },
  }),
};

export const AddressInput = (props: {
  label?: string;
  labelSize?: string;
  value?: object | string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  isReadOnly?: boolean;
  isDisabled?: boolean;

  loading?: boolean;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  handleLocationChange: Function;
}) => {
  const locationData: Location = {
    countryName: "",
    administrativeArea: "",
    administrativeAreaLevel2: "",
    placeName: "",
    sublocality: "",
    thoroughfareName: "",
    thoroughfareNumber: "",
    subUnitDesignator: "",
    subUnitIdentifier: "",
    postalCode: "",
  };

  const changeLocation = (value) => {
    if (value) {
      // props.setValue(value);
      geocodeByPlaceId(value.value.place_id)
        .then((results) => {
          // console.log('THIS IS THE RESULT OF GEOCODING AFTER LOCATION SELECTION', results);
          locationData.countryName = results[0].address_components.find(
            (component) => {
              return component.types.includes("country");
            }
          )?.long_name;

          locationData.administrativeArea = results[0].address_components.find(
            (component) => {
              return component.types.includes("administrative_area_level_1");
            }
          )?.long_name;

          locationData.administrativeAreaLevel2 =
            results[0].address_components.find((component) => {
              return component.types.includes("administrative_area_level_2");
            })?.long_name;

          locationData.placeName = results[0].address_components.find(
            (component) => {
              return component.types.includes("locality");
            }
          )?.long_name;

          locationData.sublocality = results[0].address_components.find(
            (component) => {
              return component.types.includes("sublocality");
            }
          )?.long_name;

          locationData.postalCode = results[0].address_components.find(
            (component) => {
              return component.types.includes("postal_code");
            }
          )?.long_name;

          locationData.thoroughfareName = results[0].address_components.find(
            (component) => {
              return component.types.includes("route");
            }
          )?.long_name;

          locationData.thoroughfareNumber = results[0].address_components.find(
            (component) => {
              return component.types.includes("street_number");
            }
          )?.long_name;

          locationData.subUnitDesignator = results[0].address_components.find(
            (component) => {
              return component.types.includes("floor ");
            }
          )?.long_name;

          locationData.subUnitIdentifier = results[0].address_components.find(
            (component) => {
              return component.types.includes("room");
            }
          )?.long_name;

          props.handleLocationChange(value, locationData);
          // return locationData;
        })
        .catch((error) => console.error(error));
    }
  };

  return (
    <Box height='65px' width='inherit'>
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
          isLoaded={
            props?.defaultValue?.length
              ? true
              : (props?.defaultValue?.length === 0 ||
                  props?.defaultValue === null) &&
                !props.loading
              ? true
              : false
          }
          startColor='greys.100'
          endColor='greys.400'
        >
          <GooglePlacesAutocomplete
            apiKey={appConfig.REACT_APP_GOOGLE_MAPS_API_KEY}
            selectProps={{
              defaultInputValue: props.defaultValue,
              value: props.value,
              onChange: (e) => {
                changeLocation(e);
              },
              placeholder: props.placeholder,
              isDisabled: props.isDisabled,
              styles: customStyles,
            }}
          />
        </Skeleton>
      </FormControl>
    </Box>
  );
};

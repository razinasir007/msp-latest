import React from "react";
import * as auto from "@choc-ui/chakra-autocomplete";

interface Props<T> {
  options: T[];
  selected?: T;
  placeholder?: string;
  // Should return a searchable string value of the passed in object
  getValue?: (value: T) => string;
  onSelect?: (value: T) => void;
}

/**
 * This fucntional component returns a standard autocomplete input that can take either custom objects
 * or string values. When dealing with custom types, make sure to pass the 'getValue' function so that
 * we can work with searchable types.
 */
export function AutoCompleteInput<T>(props: Props<T>) {
  const { options, placeholder, selected, getValue, onSelect } = props;

  const extractValue = (item) => (getValue ? getValue(item) : String(item));
  const selectValue = (value) => onSelect && onSelect(value);

  return (
    <auto.AutoComplete openOnFocus>
      <auto.AutoCompleteInput
        value={extractValue(selected)}
        placeholder={placeholder}
        onSelect={(e) => {
          // only call our "onSelect" function if the current value is a valid option
          const match = options.find(
            (element) => extractValue(element) === e.target.value
          );
          if (match) {
            selectValue(match);
          }
        }}
      />
      <auto.AutoCompleteList>
        {options.map((item, cid) => (
          <auto.AutoCompleteItem
            key={`option-${cid}`}
            value={extractValue(item)}
            textTransform='capitalize'
            onClick={() => selectValue(item)}
          >
            {extractValue(item)}
          </auto.AutoCompleteItem>
        ))}
      </auto.AutoCompleteList>
    </auto.AutoComplete>
  );
}

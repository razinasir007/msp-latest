import React, { useCallback, useEffect, useState } from "react";
import { SelectDropdown } from "../selectDropdown";
import { appliedFilter } from "../../../../constants";

export const externalFilter = (node, appliedFilter) => {
  //case 1: only role filter is present, return all data of that particular role
  //case 2: only status filter is present, return all data of that particular status
  //case 3: both role and status filters are present, return all data of that particular role and that particular status
  if (appliedFilter.role && appliedFilter.status === null) {
    return node.data.role?.value === appliedFilter.role.value;
  } else if (appliedFilter.status && appliedFilter.role === null) {
    return node.data.status?.value === appliedFilter.status.value;
  } else if (appliedFilter.role && appliedFilter.status) {
    return (
      node.data.status.value === appliedFilter?.status.value &&
      node.data.role.value === appliedFilter?.role.value
    );
  }
  return true;
};

export const externalFilterPresent = (appliedFilter) => {
  //return true if anyone from or both of role and status filters are present
  return Boolean(appliedFilter.role || appliedFilter.status);
};

interface filterProps {
  placeholder: string;
  options: any;
  paginationOnFilterChanged?: any;
  window: any;
  type: string;
}

export const Filter = ({
  placeholder,
  options,
  paginationOnFilterChanged,
  window,
  type,
}: filterProps) => {
  //to check and set the type of filter, role OR status, coming as props from parent component
  const [filterType, setFilterType] = useState("");
  const [filter, setFilter] = useState({});

  const externalFilterChanged = useCallback((newFilter, filterType) => {
    //check if new filter applied is status filter or role filter
    if (filterType === "status") {
      //if it is a status filter set value of status property of appliedFilter object to the value of newFilter
      appliedFilter.status = newFilter;
    } else if (filterType === "role") {
      //if it is a role filter set value of role property of appliedFilter object to the value of newFilter
      appliedFilter.role = newFilter;
    }
    if(window.gridApi){
      window.gridApi.onFilterChanged();
    }
    //update pagination when a filter is applied
    paginationOnFilterChanged && paginationOnFilterChanged();
  }, []);

  if (typeof window !== "undefined") {
    // Attach external event handlers to window so they can be called from index.html
    (window as any).externalFilterChanged = externalFilterChanged;
  }

  useEffect(() => {
    if (filterType) {
      externalFilterChanged(filter, filterType);
    }
  }, [filterType, filter]);

  useEffect(() => {
    appliedFilter.status = null;
    appliedFilter.role = null;
  }, []);

  return (
    <SelectDropdown
      isClearable={true}
      options={options}
      placeholder={placeholder}
      containerHeight='33px'
      containerWidth='200px'
      onChange={(newFilter) => {
        setFilterType(type);
        setFilter(newFilter);
      }}
    />
  );
};

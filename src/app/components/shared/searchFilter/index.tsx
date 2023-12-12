import React from "react";
import { Search2Icon } from "@chakra-ui/icons";
import { LabeledInput } from "../labeledInput";
import PaginationLast from "react-bootstrap/lib/PaginationLast";
interface searchProps {
  gridRef: any;
  getDisplayedRowCount?: any;
  paginationOnFilterChanged?: any;
}
export default function Search({
  gridRef,
  getDisplayedRowCount,
  paginationOnFilterChanged,
}: searchProps) {
  const handleSearchChange = (event) => {
    gridRef.current.api.setQuickFilter(event.target.value);
    if(getDisplayedRowCount)
    {getDisplayedRowCount();}
    if (paginationOnFilterChanged) {
      paginationOnFilterChanged();
    }
  };
  return (
    <LabeledInput
      placeholder="Search Filter"
      leftIcon={<Search2Icon />}
      containerHeight="33px"
      onChange={handleSearchChange}
    />
  );
}

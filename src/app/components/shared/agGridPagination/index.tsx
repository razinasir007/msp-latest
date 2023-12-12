import React, { useState, useEffect, useCallback } from "react";

import { HStack, IconButton } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

interface paginationProps {
  gridRef: any;
  rowData: any;
  filteredData?: any;
}

export function AgGridPagination({
  gridRef,
  rowData,
  filteredData,
}: paginationProps) {
  // MY PROPS ARE:
  //gridRef: gets our complete grid and its information
  //rowData: triggers one useEffect to update pagination if any of our grid data is changed e.g. after a user is deleted
  //filteredData: triggers one useEffect to update pagination after a filter is applied e.g. after search filter

  //pages state array has page number (index+1) and active status for pages
  const [pages, setPages] = useState<Array<{ index: Number; active: Boolean }>>(
    []
  );
  //totalPages state is to handle lag in updation of pages using useEffect depenedency
  const [totalPages, setTotalPages] = useState<Number>();

  //HANDLE PAGINATION FUNCTIONALITY
  //Get total pages from ag-grid
  const onPaginationChanged = useCallback(() => {
    // Workaround for bug in events order
    if (gridRef.current.api) {
      setTotalPages(gridRef.current.api.paginationGetTotalPages());
    }
  }, [gridRef.current]);

  //Set the pages array for pagination on first initial render
  const setPagesArray = () => {
    if (totalPages !== undefined) {
      if (totalPages !== 0) {
        const arr: Array<{ index: Number; active: Boolean }> = [
          { index: 0, active: true },
        ];
        for (let i = 1; i < totalPages; i++) {
          arr.push({ index: i, active: false });
        }
        setPages(arr);
      }
    }
  };

  //Get current page and change its status to active after every page change
  const getCurrPageAndChangeActive = () => {
    const currPageIndex = gridRef.current.api.paginationGetCurrentPage();
    const items1 = pages.map((ele) => {
      ele.active = ele.index === currPageIndex ? true : false;
      return ele;
    });
    setPages(items1);
  };

  //Previous page button functionality
  const onBtPrevious = () => {
    gridRef.current.api.paginationGoToPreviousPage();
    getCurrPageAndChangeActive();
  };

  //Next page button functionality
  const onBtNext = () => {
    gridRef.current.api.paginationGoToNextPage();
    getCurrPageAndChangeActive();
  };

  //Page number buttons functionality
  const handleNumberClick = (page) => {
    gridRef.current.api.paginationGoToPage(page.index);
    getCurrPageAndChangeActive();
  };

  //Use effect for getting total pages when the grid is ready
  useEffect(() => {
    onPaginationChanged();
  }, [gridRef.current]);

  //Use effect for setting pages on first render
  useEffect(() => {
    setPagesArray();
  }, [totalPages]);

  //Use effect with rowData and filteredData as dependancy
  useEffect(() => {
    const totalPages2 = gridRef.current?.api?.paginationGetTotalPages();
    //pages before deletion of users greater than pages after deletion
    //OR
    //pages before filter greater than pages after filter
    if (pages.length > totalPages2) {
      let tempArr = pages.slice(0, totalPages2); //remove page(s) from the end of pages state if above condition is true
      setPages(tempArr);
    }
    //pages before reverting the filter lesser than pages after reverting the filter
    else if (pages.length < totalPages2) {
      //setting total pages state to fresh value of pages
      setTotalPages(totalPages2);
      //calling setPagesArray function to update the pages array according to fresh total pages value
      setPagesArray();
    }
    const currentPage = gridRef.current?.api?.paginationGetCurrentPage();
    setPages((prevPages) =>
      prevPages.map((obj, index) => {
        return index === currentPage
          ? { ...obj, active: true } //get current page and set its active status to true
          : { ...obj, active: false }; // set the active status of rest of pages to false
      })
    );
  }, [rowData, filteredData]);

  return (
    <>
      {pages.length > 0 ? (
        <HStack  spacing='15px' alignItems='center'>
          <IconButton
            variant='outline'
            aria-label='Previous Page'
            size='sm'
            boxSize='32px'
            onClick={onBtPrevious}
            fontSize='18px'
            icon={<ChevronLeftIcon />}
          />
          {pages.map((ele, index) => {
            return (
              <IconButton
                key={index}
                aria-label={`Page number ${ele.index.valueOf() + 1}`}
                icon={<span>{ele.index.valueOf() + 1}</span>}
                size='sm'
                variant={ele.active ? "solid" : "outline"}
                textAlign='center'
                fontSize='18px'
                onClick={() => handleNumberClick(ele)}
              />
            );
          })}
          <IconButton
            variant='outline'
            aria-label='Next Page'
            size='sm'
            boxSize='32px'
            fontSize='18px'
            onClick={onBtNext}
            icon={<ChevronRightIcon />}
          />
        </HStack>
      ) : (
        ""
      )}
    </>
  );
}

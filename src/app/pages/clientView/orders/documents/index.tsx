import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Flex,
  HStack,
  SkeletonCircle,
  SkeletonText,
  VStack,
} from "@chakra-ui/react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { AiFillEye, AiFillDelete } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { IoIosCloudDownload } from "react-icons/io";
import { MdLibraryAdd } from "react-icons/md";
import { GetOrgClientDocs } from "../../../../../apollo/organizationQueries";
import { useQuery } from "@apollo/client";
import moment from "moment";

export const Documents = (props: { clientId }) => {
  const { clientId } = props;
  const mainCardStyle = {
    padding: "0",
    width: "100%",
    borderRadius: "4px",
    borderColor: "greys.300",
  };
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const [docsData, setDocsData] = useState([]);
  const containerStyle = useMemo(
    () => ({ width: "100%", height: "300px" }),
    []
  );
  const {
    loading: clientDocsLoading,
    error: clientDocsError,
    data: clientDocsData,
  } = useQuery(GetOrgClientDocs, {
    variables: { clientId: clientId },
  });

  useEffect(() => {
    if (
      clientDocsData &&
      clientDocsData.organizationFormsFilled &&
      clientDocsData.organizationFormsFilled.lookupByClient
    ) {
      const formattedData =
        clientDocsData.organizationFormsFilled.lookupByClient.map((docs) => {
          return {
            documentName: docs.formType,
            fileSize: "20kbs",
            lastEdited:
              docs.updatedAt == null
                ? "None"
                : moment(docs.updatedAt).format("LL"),
            dateUploaded: moment(docs.createdAt).format("LL"),
            pdf: docs.pdf,
          };
        });
      setDocsData(formattedData);
    }
  }, [clientDocsData]);
  const handleEyeClick = (pdfBase64) => {
    // Convert base64 to a Blob
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    // Create a blob URL
    const blobUrl = URL.createObjectURL(blob);

    // Open a new tab with the blob URL
    window.open(blobUrl, "_blank");
  };

  const columnDefs: ColDef[] = [
    {
      field: "documentName",
      headerName: "Document Name",
      width: 280,
      filter: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    {
      field: "fileSize",
      headerName: "File Size",
      width: 180,
      unSortIcon: true,
    },

    {
      field: "lastEdited",
      headerName: "Last Edited",
      width: 180,
      editable: false,
      unSortIcon: true,
    },
    {
      field: "dateUploaded",
      headerName: "Date Uploaded",
      width: 250,
      editable: false,
      unSortIcon: true,
    },
    {
      headerName: "",
      field: "action",
      width: 180,
      cellRendererFramework: (params) => (
        <div style={{ marginTop: 7 }}>
          <AiFillEye
            size={23}
            style={{ cursor: "pointer" }}
            onClick={() => handleEyeClick(params.data.pdf)}
          />
        </div>
      ),
    },
  ];
  return (
    <Card variant='outline' style={mainCardStyle}>
      <CardBody padding='16px'>
        <Flex justifyContent='space-between'>
          <HStack spacing='14px' ml='25px'>
            <Checkbox />
            <FiUpload size={20} />
            <AiFillDelete size={20} />
            <IoIosCloudDownload size={20} />
            <MdLibraryAdd size={20} />
          </HStack>

          <Box>
            <Button variant='outline' size='sm'>
              Upload Document
            </Button>
          </Box>
        </Flex>
        <VStack spacing='20px' mt='20px' width='100%'>
          {clientDocsLoading ? (
            <Box
              padding='6'
              boxShadow='lg'
              bg='greys.400'
              width='100%'
              minH='235px'
              maxH='235px'
              mt='20px'
              borderRadius='4px'
            >
              <SkeletonCircle
                size='10'
                startColor='greys.200'
                endColor='greys.600'
              />
              <SkeletonText
                mt='4'
                noOfLines={5}
                spacing='4'
                skeletonHeight='5'
              />
            </Box>
          ) : (
            <Box style={containerStyle}>
              <Box style={gridStyle} className='ag-theme-material'>
                <AgGridReact
                  rowData={docsData}
                  columnDefs={columnDefs}
                ></AgGridReact>
              </Box>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

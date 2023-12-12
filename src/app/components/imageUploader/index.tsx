import React, { useState } from "react";
import {
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Input,
  Spacer,
  Text,
} from "@chakra-ui/react";
import UploadedTable from "./uploadedTable";
import { BiArrowBack } from "react-icons/bi";
import { useGlobalState } from "../../../state/store";
import { LabeledInput } from "../shared/labeledInput";
import { Search2Icon } from "@chakra-ui/icons";
import Swal from "sweetalert2";

const rootDirectory = {
  Originals: {
    images: [],
  },
  Presentation: {
    images: [],
  },
  Purchased: {
    images: [],
  },
  "Client Gallery": {
    images: [],
  },
  Documents: {
    images: [],
  },
};

export function Uploader() {
  const state = useGlobalState();
  const uploadedImages = state.getImages();
  const [folders, setFolders] = useState(rootDirectory);
  const [currentFolder, setCurrentFolder] = useState([]);
  const [breadCrumb, setBreadCrumb] = useState<String[]>([]);
  const [folderStack, setFolderStack] = useState([]);
  const [searchItem, setSearchItem] = useState("");
  const [foldername, setFolderName] = useState("");
  const [nestedFolderName, setNestedFolderName] = useState("");

  const handleDeleteAll = () => {
    state.deleteAllImages();
    setFolderStack([]);
    setBreadCrumb([]);
    setFolders(rootDirectory);
  };

  const handleAddFolder = () => {
    console.log("working");
    if (!foldername.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Folder name cannot be empty",
      });
      return;
    }
    // Check if the nested folder already exists
    if (folders[foldername]) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Folder already exists",
      });
      return;
    }
    setFolders((prev) => ({
      ...prev,
      [foldername]: {
        images: [],
      },
    }));
  };
  const handleAddNestedFolder = () => {
    // Ensure that the folder name is not empty
    if (!nestedFolderName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Folder name cannot be empty",
      });
      return;
    }

    // Check if the current folder is empty
    if (!currentFolder) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error while creating the folder",
      });
      return;
    }

    // Check if the nested folder already exists
    if (currentFolder[nestedFolderName]) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Folder already exists",
      });
      return;
    }

    // Create a copy of the current folder
    const updatedFolder = { ...currentFolder };

    // Add the nested folder to the current folder
    updatedFolder[nestedFolderName] = {
      images: [],
    };

    // Update the state with the new folder
    setCurrentFolder(updatedFolder);

    // Reset the nested folder name
    setNestedFolderName("");
  };

  /**
   * Handles the action of navigating back in the folders hierarchy.
   *
   * This function primarily updates both the `folderStack` and the `breadCrumb` states.
   * The functional update form of `setState` is utilized to ensure the most recent state is accessed.
   * This approach addresses potential race conditions and issues due to asynchronous state updates.
   *
   * ## Behavior:
   * 1. If the `folderStack` is empty, it's returned unchanged.
   * 2. Otherwise, the last folder is popped from the `folderStack`.
   * 3. The `currentFolder` state is then updated:
   *    - Set to the last item in the `folderStack` if it's not empty.
   *    - Set to an empty array if the `folderStack` is empty.
   * 4. The `breadCrumb` state is updated by removing its last item, indicating a step back in the navigation hierarchy.
   */
  function handleBackClick() {
    setFolderStack((prevStack) => {
      if (prevStack.length === 0) return prevStack;
      const newStack = [...prevStack];
      newStack.pop();
      setCurrentFolder(
        newStack.length === 0 ? [] : newStack[newStack.length - 1]
      );
      return newStack;
    });

    setBreadCrumb((prevBreadCrumb) =>
      prevBreadCrumb.slice(0, prevBreadCrumb.length - 1)
    );
  }

  // function handleBackClick() {
  //   const folderToSet = folderStack.length === 1 ? [[]] : folderStack.slice(-1);
  //   const prevFolder = folderStack.pop();
  //   setCurrentFolder(folderToSet[0]);
  //   setFolderStack([...folderStack]);
  //   setBreadCrumb((prevStack) => prevStack.slice(0, prevStack.length - 1));
  // }
  console.log("current folder", currentFolder);

  return (
    <Grid
      className='mt-4'
      h='100%'
      templateAreas={`"header"
                  "main"`}
      gridTemplateRows={"50px 1fr"}
      overflow='hidden'
      borderRadius='base'
    >
      <GridItem
        area={"header"}
        // bg='#EAE8E3'
        paddingX={"20px"}
        paddingTop={"10px"}
      >
        <Flex>
          {breadCrumb.length !== 0 ? (
            <HStack>
              <BiArrowBack
                size={25}
                onClick={handleBackClick}
                style={{ cursor: "pointer" }}
              />
              <Text fontSize='p4'>{"Home > "}</Text>
              {breadCrumb.map((folder, index) => (
                <React.Fragment key={index}>
                  <Text fontSize='p4'>{folder}</Text>
                  {index < breadCrumb.length - 1 && (
                    <Text fontSize='p4'>{">"}</Text>
                  )}
                </React.Fragment>
              ))}
            </HStack>
          ) : (
            <Text fontSize='p4'>Home</Text>
          )}
          {/* <Text fontSize='lg' as='b'>
            Uploaded Files : {uploadedImages.length}
          </Text> */}
          <Spacer />
          {/* <L
            type='text'
            w='200px'
            borderRadius='0px'
            placeholder='search'
            
          /> */}
          <LabeledInput
            placeholder='Search'
            leftIcon={<Search2Icon />}
            containerHeight='33px'
            borderRadius='50px'
            onChange={(e) => setSearchItem(e.target.value)}
          />
          {uploadedImages.length === 0 ? (
            <></>
          ) : (
            <Button
              variant='mspCustom'
              onClick={handleDeleteAll}
              size='sm'
              ml='15px'
              boxShadow='0 2px 4px rgba(0, 0, 0, 0.1)'
            >
              Delete All
            </Button>
          )}
        </Flex>
      </GridItem>

      <GridItem
        area={"main"}
        // bg='#EAE8E3'
        className='hide-scrollbar'
        paddingX={"20px"}
        paddingY={"10px"}
      >
        <UploadedTable
          searchItem={searchItem}
          breadCrumb={breadCrumb}
          setBreadCrumb={setBreadCrumb}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          folderStack={folderStack}
          setFolderStack={setFolderStack}
          folders={folders}
          setFolders={setFolders}
          setFolderName={setFolderName}
          foldername={foldername}
          handleAddFolder={handleAddFolder}
          handleAddNestedFolder={handleAddNestedFolder}
          nestedFoldername={nestedFolderName}
          setNestedFolderName={setNestedFolderName}
        />
      </GridItem>
    </Grid>
  );
}

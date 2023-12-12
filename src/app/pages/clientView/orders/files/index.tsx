import React, { useState } from "react";
import {
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { FileSystem } from "../../../../components/clientView/files/fileSystem";
import { BiArrowBack } from "react-icons/bi";

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
export const Files = (props: { orderId }) => {
  const [folders, setFolders] = useState(rootDirectory);
  const [currentFolder, setCurrentFolder] = useState([]);
  const [breadCrumb, setBreadCrumb] = useState<String[]>([]);
  const [folderStack, setFolderStack] = useState([]);

  // if client does not matches with the previously selected client then set cureent folder to null

  // useEffect(() => {
  //   if (
  //     clientDetails.length > 0 &&
  //     clientDetails[0].id !== props.clientDetails.id
  //   ) {
  //     setFolderStack([]);
  //     setBreadCrumb([]);
  //     setFolders(rootDirectory);
  //   }
  // }, []);

  // const handleDeleteAll = () => {
  //   state.deleteAllImages();
  //   setFolderStack([]);
  //   setBreadCrumb([]);
  //   setFolders(rootDirectory);
  // };

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
          {/* {uploadedImages.length === 0 ? (
            <></>
          ) : (
            <Button variant='mspCustom' onClick={handleDeleteAll} size='sm'>
              Delete All
            </Button>
          )} */}
        </Flex>
      </GridItem>

      <GridItem
        area={"main"}
        // bg='#EAE8E3'
        className='hide-scrollbar'
        paddingX={"20px"}
        paddingY={"10px"}
      >
        <FileSystem
          orderId={props.orderId}
          breadCrumb={breadCrumb}
          setBreadCrumb={setBreadCrumb}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          folderStack={folderStack}
          setFolderStack={setFolderStack}
          folders={folders}
          setFolders={setFolders}
        />
      </GridItem>
    </Grid>
  );
};

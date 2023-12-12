import React, { useState } from "react";
import Masonry from "react-masonry-css";
import { useGlobalState } from "../../../state/store";
import {
  Box,
  Checkbox,
  Flex,
  HStack,
  Image,
  SimpleGrid,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import "./styles.scss";
import { ImageCard } from "../clientView/imageCard/imageCard";
import { BiArrowBack } from "react-icons/bi";
import { Folder } from "../interfaces";
import { extractImagesByFolders } from "../../../constants";
import { UploadedPhoto } from "../../../state/interfaces";

export function GalleryView() {
  const state = useGlobalState();
  const checked = state.getSelectAll();
  const uploadedImages = state.getImages();
  const selectedImages = state.getSelectedImages();
  const [folderStack, setFolderStack] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder[]>(null);
  const [breadCrumb, setBreadCrumb] = useState<String[]>([]);
  const folders = extractImagesByFolders(uploadedImages);

  // const imagesArray = uploadedImages.map((image) => (
  //   <Box>
  //     <Image
  //       key={image.id}
  //       src={image.base64}
  //       onClick={() => imageOnClick(image)}
  //       className={`${isImageSelected(image)}`}
  //     />
  //   </Box>
  // ));
  const imagesArray = folders.root.images.map((image: UploadedPhoto) => (
    <Box key={image.id}>
      <Image
        key={image.id}
        src={image.base64}
        onClick={() => imageOnClick(image)}
        className={`${isImageSelected(image)}`}
      />
    </Box>
  ));

  function onChange(event) {
    state.setSelectAll(event.target.checked);
    // CASE 1: SELECT all images
    if (event.target.checked) {
      state.setSelectedImages([...uploadedImages]);
    }
    // CASE 2: UNSELECT all images
    else {
      state.setSelectedImages([]);
    }
  }

  // this function dynamically adds a class to our selected image component
  function isImageSelected(image: UploadedPhoto) {
    const alreadyAdded = selectedImages.find((item) => item.id === image.id);
    return alreadyAdded ? "selected-image" : "";
  }

  function imageOnClick(image: UploadedPhoto) {
    state.selectPhoto(image);
  }
  function handleFolderClick(folder, folderName) {
    setBreadCrumb((prevStack) => [...prevStack, folderName]);
    setFolderStack((prevStack: any) => [...prevStack, currentFolder]);
    setCurrentFolder(folder);
  }
  function handleBackClick() {
    const prevFolder: any = folderStack.pop();
    setCurrentFolder(prevFolder);
    setFolderStack([...folderStack]);
    setBreadCrumb((prevStack) => prevStack.slice(0, prevStack.length - 1));
  }

  function handleFolderSelection(folderName, check) {
    if (check.target.checked) {
      state.setSelectedImages((prevState) => {
        return [...prevState, ...folderName.images];
      });
    }
    // CASE 2: UNSELECT folder images
    else {
      state.setSelectedImages((prevSelectedImages) =>
        prevSelectedImages.filter(
          (image) =>
            !folderName.images.some(
              (folderImage) => folderImage.id === image.id
            )
        )
      );
    }
  }

  function isImageSelectedFolder(folderName) {
    const alreadyAdded = selectedImages.find(
      (item) => item.id === folderName.id
    );
    return alreadyAdded ? true : false;
  }

  return (
    <>
      <Flex>
        <Text fontSize='lg' as='b'>
          All Images : {uploadedImages.length}
        </Text>
        <Spacer />
        {uploadedImages.length === 0 ? (
          <></>
        ) : (
          <Checkbox
            // the random key forces a re-render of the component and updates its defaultChecked property
            key={Math.random()}
            colorScheme={"gray"}
            onChange={onChange}
            defaultChecked={checked}
          >
            Select All
          </Checkbox>
        )}
      </Flex>

      <Box mt='40px' mb='30px' w='100%'>
        {currentFolder ? (
          // Displaying nested folders and images
          <>
            <Box>
              <HStack>
                <BiArrowBack
                  size={30}
                  onClick={handleBackClick}
                  style={{ cursor: "pointer" }}
                />
                {breadCrumb.map((folder, index) => (
                  <React.Fragment key={index}>
                    <Text fontSize='p4' fontWeight='400'>
                      {folder}
                    </Text>
                    {index < breadCrumb.length - 1 && <Text>/</Text>}
                  </React.Fragment>
                ))}
              </HStack>
            </Box>
            <VStack spacing='30px' mt='20px'>
              <Box w='100%'>
                <SimpleGrid columns={3} spacing='30px' width='100%'>
                  {Object.keys(currentFolder).map((folderName, index) => {
                    if (folderName !== "images") {
                      const folder = currentFolder[folderName];
                      return (
                        <Box key={index}>
                          <ImageCard
                            folderSelection
                            checked={isImageSelectedFolder(folder.images[0])}
                            handleFolderCheck={(check) =>
                              handleFolderSelection(folder, check)
                            }
                            folderName={folderName}
                            folderClick={() =>
                              handleFolderClick(folder, folderName)
                            }
                            bg='#E3E3E3'
                          />
                        </Box>
                      );
                    }
                    return null;
                  })}
                </SimpleGrid>
              </Box>
              <Masonry
                breakpointCols={3}
                className='my-masonry-grid'
                columnClassName='my-masonry-grid_column'
              >
                {currentFolder.images.map((image, index) => (
                  <Box mt='30px' w='100%' key={index}>
                    <Image
                      key={image.id}
                      src={image.base64}
                      onClick={() => imageOnClick(image)}
                      className={`${isImageSelected(image)}`}
                    />
                  </Box>
                ))}
              </Masonry>
            </VStack>
          </>
        ) : (
          <SimpleGrid columns={3} spacing='30px' width='100%'>
            {Object.keys(folders)
              .filter((el) => el !== "root")
              .map((ele, index) => {
                return (
                  <Box key={index}>
                    <ImageCard
                      folderName={ele}
                      checked={isImageSelectedFolder(folders[ele].images[0])}
                      folderSelection
                      handleFolderCheck={(check) =>
                        handleFolderSelection(folders[ele], check)
                      }
                      folderClick={() => handleFolderClick(folders[ele], ele)}
                      bg='#E3E3E3'
                    />
                  </Box>
                );
              })}
          </SimpleGrid>
        )}
      </Box>
      <Masonry
        breakpointCols={3}
        className='my-masonry-grid'
        columnClassName='my-masonry-grid_column'
      >
        {imagesArray}
      </Masonry>
    </>
  );
}

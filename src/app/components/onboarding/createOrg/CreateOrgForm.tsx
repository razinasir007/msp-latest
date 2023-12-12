import React, { useState } from "react";
import {
  Box,
  Text,
  Card,
  CardBody,
  VStack,
  Center,
  HStack,
  CardHeader,
  Flex,
  Image,
} from "@chakra-ui/react";
import { LabeledInput } from "../../shared/labeledInput";
import { useGlobalState } from "../../../../state/store";
import UploadedCard from "../../imageUploader/uploadedCard";
import { AddressInput } from "../../shared/addressInput";
import { Dropper } from "../../shared/dropper";
import { FaCamera } from "react-icons/fa";
import { CreateOrgDetails } from "../../interfaces";
import { useHookstate } from "@hookstate/core";
import { GiCancel } from "react-icons/gi";

const mainCardStyle = {
  padding: "0",
  width: "50%",
  borderRadius: "4px",
  borderColor: "#E2E8F0",
  background: "#FCFCFA",
  marginTop: "30px",
};

const CreateOrgForm = (props: {
  createOrgDetails: CreateOrgDetails;
  setCreateOrgDetails;
}) => {
  const [fileLength, setFileLength] = useState(0);
  const [file, setFile] = useState({});
  const state = useGlobalState();
  const orgImage = useHookstate([]);

  let uploadedImages = orgImage.get();

  props.createOrgDetails.logo = file;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setCreateOrgDetails({
      ...props.createOrgDetails,
      [event.target.name]: event.target.value,
    });
  };

  function handleLocationChange(location, parsedLocation) {
    props.createOrgDetails.address = location.label;
    props.createOrgDetails.parsedLocation = parsedLocation;
    props.setCreateOrgDetails({ ...props.createOrgDetails });
  }

  function addOrgImages(image) {
    orgImage.set(image);
  }

  return (
    <Center>
      <Card variant='outline' style={mainCardStyle}>
        <CardHeader pb='8px'>
          <Flex width='100%' justifyContent='center'>
            <Text fontSize='h5' fontWeight='semibold'>
              Create your Organization
            </Text>
          </Flex>
        </CardHeader>
        <CardBody pt='8px'>
          <VStack width='100%' spacing='15px'>
            <LabeledInput
              containerHeight='55px'
              name='name'
              label='Name'
              labelSize='p5'
              placeholder='Name...'
              type='text'
              value={props.createOrgDetails.name}
              onChange={handleChange}
            />
            <HStack width='100%' spacing='15px'>
              <LabeledInput
                containerHeight='55px'
                label='Email'
                name='email'
                value={props.createOrgDetails.email}
                labelSize='p5'
                type='email'
                placeholder='Email...'
                onChange={handleChange}
              />
              <LabeledInput
                containerHeight='55px'
                label='Number'
                name='phoneNumber'
                labelSize='p5'
                value={props.createOrgDetails.phoneNumber}
                placeholder='Number...'
                type='number'
                onChange={handleChange}
              />
            </HStack>
            <AddressInput
              label='Address'
              labelSize='p5'
              placeholder='Address...'
              // value={props.createOrgDetails.address}
              value={{
                label: props.createOrgDetails.address,
                value: props.createOrgDetails.address,
              }}
              defaultValue={""}
              name='address'
              handleLocationChange={handleLocationChange}
            />
            <LabeledInput
              containerHeight='55px'
              label='Website'
              labelSize='p5'
              placeholder='Website...'
              value={props.createOrgDetails.website}
              name='website'
              onChange={handleChange}
            />
            <LabeledInput
              containerHeight='55px'
              label='Sales Tax'
              type='number'
              labelSize='p5'
              placeholder='Sales Tax...'
              value={props.createOrgDetails.salesTax}
              name='salesTax'
              onChange={handleChange}
            />

            {uploadedImages.length > 0 ? (
              <>
                <Box w='100%' mt='5px'>
                  <Text fontSize='p5' fontWeight='semibold'>
                    Selected Image:
                  </Text>
                </Box>
                <Box>
                  <GiCancel
                    onClick={() => {
                      orgImage.set([]), setFile({});
                    }}
                    size={20}
                    style={{ cursor: "pointer" }}
                  />
                  <Image
                    src={uploadedImages[0].base64}
                    alt='img'
                    width='200px'
                    height='150px'
                  />
                </Box>
              </>
            ) : (
              <Box w='100%'>
                <Text paddingBottom='8px' fontSize='p5' fontWeight='normal'>
                  Organization Logo
                </Text>
                <Dropper
                  height={200}
                  width='100%'
                  setFile={setFile}
                  setFilesLen={setFileLength}
                  fileState={addOrgImages}
                >
                  <FaCamera size={"40px"} />
                  <Text fontSize='h7' fontWeight='semibold' textAlign='center'>
                    Upload your Organization Image
                  </Text>
                </Dropper>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Center>
  );
};

export default CreateOrgForm;

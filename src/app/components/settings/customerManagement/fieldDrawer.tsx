import React, { useContext } from "react";
import {
  Button,
  Flex,
  VStack,
  Text,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Textarea,
  Checkbox,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { LabeledInput } from "../../shared/labeledInput";
import { EditableField, EditableTags } from "../../interfaces";
import { useMutation } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";
import {
  CreateCustomerField,
  GetCustomerFieldsByOrg,
  UpdateCustomerField,
} from "../../../../apollo/customerFieldQueries";
import { SelectDropdown } from "../../shared/selectDropdown";
import { DatatypeOptions } from "../../../../constants";
import {
  CreateCustomerTags,
  GetCustomerTagsByOrg,
  UpdateCustomerTag,
} from "../../../../apollo/customerTagQueries";
import { globalState } from "../../../../state/store";
import { useHookstate } from "@hookstate/core";
import { UserPermissions } from "../../../routes/permissionGuard";

export function FieldDrawer(props: {
  scenario: string;
  fields?: Array<EditableField>;
  field?: EditableField;
  setField?: any;
  setFields?: any;
  tags?: Array<EditableTags>;
  tag?: EditableTags;
  setTag?: any;
  setTags?: any;
  isOpen: boolean;
  onClose: any;
  onOpen?: any;
}) {
  const {
    scenario,
    fields,
    field,
    setField,
    setFields,
    tags,
    tag,
    setTag,
    setTags,
    isOpen,
    onClose,
    onOpen,
  } = props;
  const user = useHookstate(globalState.user);
  const { userPermissions } = useContext(UserPermissions);

  const [
    createCustomerField,
    {
      loading: createFieldLoading,
      error: createFieldError,
      data: createFieldData,
    },
  ] = useMutation(CreateCustomerField, {
    refetchQueries: [
      {
        query: GetCustomerFieldsByOrg,
        variables: { orgId: user!.value!.organization!.id },
      },
    ],
  });
  const [
    updateCustomerField,
    {
      loading: updateFieldLoading,
      error: updateFieldError,
      data: updateFieldData,
    },
  ] = useMutation(UpdateCustomerField, {
    refetchQueries: [
      {
        query: GetCustomerFieldsByOrg,
        variables: { orgId: user!.value!.organization!.id },
      },
    ],
  });

  const [
    createCustomerTags,
    { loading: createTagLoading, error: createTagError, data: createTagData },
  ] = useMutation(CreateCustomerTags, {
    refetchQueries: [
      {
        query: GetCustomerTagsByOrg,
        variables: { orgId: user!.value!.organization!.id },
      },
    ],
  });
  const [
    updateCustomerTag,
    { loading: updateTagLoading, error: updateTagError, data: updateTagData },
  ] = useMutation(UpdateCustomerTag, {
    refetchQueries: [
      {
        query: GetCustomerTagsByOrg,
        variables: { orgId: user!.value!.organization!.id },
      },
    ],
  });

  const scenarioMap = {
    createFields: {
      headerText: "Add Editable Field",
      label: "Field Name",
      placeholder: "Field Name...",
      name: "name",
      setData: setField,
      newData: {
        id: "",
        name: "",
        inputType: "",
        required: false,
      },
      backendCall: () => {
        // Backend call for creating fields
        const fieldId = uuidv4();
        createCustomerField({
          variables: {
            createdBy: user!.value?.uid,
            clientFieldDetail: {
              id: fieldId,
              name: field?.name,
              datatype: field?.inputType?.value,
              isRequired: field?.required,
              isEnabled: false,
              orgId: user!.value?.organization?.id,
              sortingIndex: fields?.length,
            },
          },
          onCompleted: (resp) => {
            if (resp.clients.createClientFieldDetail === true) {
              if (fields) {
                const updatedFields = [
                  ...fields,
                  {
                    id: fieldId,
                    name: field?.name,
                    inputType: {
                      value: field?.inputType?.value,
                      label: field?.inputType?.value,
                    },
                    required: field?.required,
                    sortingIndex: fields.length,
                  },
                ];
                setFields(updatedFields);
              }
              alert("Field Created Successfully");
              return onClose();
            }
          },
        });
      },
      otherFields: () => (
        <VStack spacing='16px' width='100%' alignItems='flex-start'>
          <SelectDropdown
            value={field?.inputType}
            containerHeight='55px'
            label='Input Type...'
            labelSize='p5'
            placeholder='Input Type...'
            options={DatatypeOptions}
            onChange={(selection) => {
              setField({
                ...field,
                ["inputType"]: selection,
              });
            }}
          />
          <Checkbox
            name='required'
            colorScheme={"gray"}
            onChange={(event) => {
              setField({
                ...field,
                [event.target.name]: event.target.checked,
              });
            }}
            checked={field?.required}
          >
            <Text fontSize='p5' fontWeight='normal'>
              This is a required field
            </Text>
          </Checkbox>
        </VStack>
      ),
    },
    editFields: {
      headerText: "Edit Field",
      label: "Field Name",
      placeholder: "Field Name...",
      name: "name",
      backendCall: () => {
        // Backend call for editing fields
        updateCustomerField({
          variables: {
            updatedBy: user!.value?.uid,
            clientFieldDetail: {
              id: field?.id,
              name: field?.name,
              datatype: field?.inputType?.value,
              isRequired: field?.required,
              orgId: user!.value?.organization?.id,
              sortingIndex: field?.sortingIndex,
            },
          },
          onCompleted: (resp) => {
            alert("Field Updated Successfully");
            return onClose();
          },
        });
      },
      otherFields: () => (
        <VStack spacing='16px' width='100%' alignItems='flex-start'>
          <SelectDropdown
            value={field?.inputType}
            containerHeight='55px'
            label='Input Type...'
            labelSize='p5'
            placeholder='Input Type...'
            options={DatatypeOptions}
            onChange={(selection) => {
              setField({
                ...field,
                ["inputType"]: selection,
              });
            }}
          />
          <Checkbox
            name='required'
            colorScheme={"gray"}
            onChange={(event) => {
              setField({
                ...field,
                [event.target.name]: event.target.checked,
              });
            }}
            checked={field?.required}
            defaultChecked={field?.required}
          >
            <Text fontSize='p5' fontWeight='normal'>
              This is a required field
            </Text>
          </Checkbox>
        </VStack>
      ),
    },

    createTags: {
      headerText: "Add Editable Tags",
      label: "Tag Name",
      placeholder: "Tag Name...",
      name: "name",
      setData: setTag,
      newData: {
        id: "",
        name: "",
        description: "",
      },
      backendCall: () => {
        // Backend call for creating tags
        const tagId = uuidv4();
        createCustomerTags({
          variables: {
            createdBy: user!.value?.uid,
            clientTagDetail: {
              id: tagId,
              name: tag?.name,
              description: tag?.description,
              orgId: user!.value?.organization?.id,
              sortingIndex: tags?.length,
            },
          },
          onCompleted: (resp) => {
            if (resp.clientTags.createClientTagDetail === true) {
              if (tags) {
                const updatedTags = [
                  ...tags,
                  {
                    id: tagId,
                    name: tag?.name,
                    description: tag?.description,
                    orgId: user!.value?.organization?.id,
                    sortingIndex: tags?.length,
                  },
                ];
                setTags(updatedTags);
              }
              alert("Tag Created Successfully");
              return onClose();
            }
          },
        });
      },
      otherFields: () => (
        <>
          <Text fontSize={"p5"} fontWeight='normal'>
            Description
          </Text>
          <Textarea
            placeholder='Description...'
            name='description'
            _placeholder={{
              fontSize: "14px",
            }}
            borderRadius='4px'
            onChange={(event) => {
              setTag({
                ...tag,
                [event.target.name]: event.target.value,
              });
            }}
            value={tag?.description}
          />
        </>
      ),
    },
    editTags: {
      headerText: "Edit Tag",
      label: "Tag Name",
      placeholder: "Tag Name...",
      name: "name",
      backendCall: () => {
        // Backend call for editing tags
        updateCustomerTag({
          variables: {
            updatedBy: user!.value?.uid,
            clientTagDetail: {
              id: tag?.id,
              name: tag?.name,
              description: tag?.description,
              orgId: user!.value?.organization?.id,
              sortingIndex: tag?.sortingIndex,
            },
          },
          onCompleted: (resp) => {
            alert("Tag Updated Successfully");
            return onClose();
          },
        });
      },
      otherFields: () => (
        <>
          <Text fontSize={"p5"} fontWeight='normal'>
            Description
          </Text>
          <Textarea
            placeholder='Description...'
            name='description'
            _placeholder={{
              fontSize: "14px",
            }}
            borderRadius='4px'
            onChange={(event) => {
              setTag({
                ...tag,
                [event.target.name]: event.target.value,
              });
            }}
            value={tag?.description}
          />
        </>
      ),
    },
  };

  const {
    headerText,
    label,
    placeholder,
    name,
    setData,
    newData,
    backendCall,
    otherFields,
  } = scenarioMap[scenario];

  // this handleChange is just for the name input for fields or tags
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    field
      ? setField({
          ...field,
          [event.target.name]: event.target.value,
        })
      : setTag({
          ...tag,
          [event.target.name]: event.target.value,
        });
  };

  // const clear = () => {
  //   setNewUserDetails({
  //     fullname: "",
  //     email: "",
  //     status: StatusOptions[0],
  //     role: props.roleOptions[1],
  //     store: "",
  //   });
  // };

  return (
    <>
      {onOpen && (
        <IconButton
          sx={{
            ":hover": {
              backgroundColor: "transparent",
            },
          }}
          variant='ghost'
          height='fit-content'
          aria-label='Field Drawer Trigger'
          icon={<AddIcon />}
          onClick={() => {
            setData(newData);
            return onOpen();
          }}
          isDisabled={
            userPermissions.fullAccess || userPermissions.create ? false : true
          }
        />
      )}
      <Drawer isOpen={isOpen} onClose={onClose} placement='right' size={"xs"}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader
            borderBottomWidth='1px'
            padding='16px 24px'
            borderColor='greys.300'
          >
            <Text fontSize='h6' fontWeight='semibold' lineHeight='22px'>
              {headerText}
            </Text>
          </DrawerHeader>

          <DrawerBody padding='16px 24px'>
            <VStack spacing='8px' width='100%' alignItems='flex-start'>
              <LabeledInput
                containerHeight='55px'
                label={label}
                labelSize='p5'
                placeholder={placeholder}
                name={name}
                value={field?.name || tag?.name}
                onChange={handleChange}
              />
              {otherFields && otherFields()}
            </VStack>
          </DrawerBody>

          <DrawerFooter
            borderTopWidth='1px'
            padding='16px 24px'
            borderColor='greys.300'
          >
            <Flex justifyContent='end'>
              <Button
                mr={4}
                size='sm'
                variant='outline'
                //   onClick={() => setReset(!reset)}
              >
                Clear
              </Button>
              <Button
                size='sm'
                variant='solid'
                loadingText='Saving...'
                spinnerPlacement='start'
                onClick={backendCall}
                isLoading={
                  createFieldLoading ||
                  updateFieldLoading ||
                  createTagLoading ||
                  updateTagLoading
                }
              >
                {field?.id === "" || tag?.id === "" ? "Save" : "Update"}
              </Button>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

import React, { useEffect, useState, useContext } from "react";
import { Button, Flex, TagLabel, HStack, Tag, Spinner } from "@chakra-ui/react";
import { AddIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { SelectDropdown } from "../../shared/selectDropdown";
import { v4 as uuidv4 } from "uuid";
import { useMutation } from "@apollo/client";
import { CreateForm } from "../../../../apollo/formsQueries";
import { LabeledInput } from "../../shared/labeledInput";
import { UserPermissions } from "../../../routes/permissionGuard";

interface FormDetails {
  name: string;
  createdBy: string;
  id: string;
  locId: string;
  orgId: string;
}

const FormOptions = [
  { value: "INTAKE_FORM", label: "INTAKE FORM" },
  { value: "CHECKOUT_FORM", label: "CHECKOUT FORM" },
  { value: "PHOTOSHOOT_CONSENT_FORM", label: "PHOTOSHOOT CONSENT FORM" },
  { value: "CUSTOM_FORM", label: "Create your own custom form..." },
];

export const CreateFormTag = (props) => {
  const { userPermissions } = useContext(UserPermissions);
  const [addForm, setAddForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [customForm, setCustomForm] = useState(false);
  const [options, setOptions] = useState<Array<any>>([]);

  const [formDetails, setFormDetails] = useState<FormDetails>({
    name: "",
    createdBy: props.user!.value!.uid,
    id: "",
    locId: props.locId,
    orgId: props.user!.value!.organization!.id,
  });

  const [createForm, { loading: createFormLoading, data: createFormData }] =
    useMutation(CreateForm);

  useEffect(() => {
    setCreateLoading(createFormLoading);
  }, [createFormLoading]);

  const handleSave = () => {
    const finalFormDetails = {
      ...formDetails,
      id: uuidv4(),
    };

    createForm({
      variables: {
        ...finalFormDetails,
      },
      onCompleted: (resp) => {
        const updatedForms = [...props.forms, finalFormDetails];
        props.setForms(updatedForms);
        setCustomForm(false);
        return setAddForm(false);
      },
    });
  };

  return (
    <>
      {addForm ? (
        <Tag
          width='100%'
          size='lg'
          variant='subtle'
          colorScheme='blackAlpha'
          backgroundColor='#F7F5F0'
          borderRadius='full'
          padding='12px'
        >
          <Flex w='100%' justifyContent='space-between'>
            <TagLabel width='95%'>
              {customForm ? (
                <LabeledInput
                  containerHeight='35px'
                  labelSize='p5'
                  name='firstname'
                  placeholder='Enter Form Name'
                  type='text'
                  onChange={(event) => {
                    const updatedFormDetails = {
                      ...formDetails,
                      name: event.target.value,
                    };
                    setFormDetails(updatedFormDetails);
                  }}
                />
              ) : (
                <SelectDropdown
                  containerHeight='35px'
                  labelSize='p5'
                  placeholder='Select Form type...'
                  options={options}
                  onChange={(selection) => {
                    if (selection.value === "CUSTOM_FORM") {
                      setCustomForm(true);
                    } else {
                      const updatedFormDetails = {
                        ...formDetails,
                        name: selection.value,
                      };
                      setFormDetails(updatedFormDetails);
                    }
                  }}
                />
              )}
            </TagLabel>
            <HStack spacing='16px'>
              <CloseIcon
                boxSize='16px'
                onClick={() => {
                  setAddForm(false);
                  setOptions([]);
                }}
              />
              {createLoading ? (
                <Spinner />
              ) : (
                <CheckIcon boxSize='16px' onClick={handleSave} />
              )}
            </HStack>
          </Flex>
        </Tag>
      ) : (
        <>
          <Button
            isDisabled={
              userPermissions.fullAccess || userPermissions.create
                ? false
                : true
            }
            onClick={() => {
              setAddForm(true);
              const formsOnCurrentLocation = props.forms.filter(
                (form) => form.locId === props.locId
              );

              const filteredFormOptions = FormOptions.filter((option) => {
                // Check if the condition holds for every object in formsOnCurrentLocation
                return formsOnCurrentLocation.every(
                  (form) => option.value !== form.name
                );
              });
              setOptions(filteredFormOptions);
            }}
            variant='outline'
            size='sm'
            leftIcon={<AddIcon />}
          >
            Add New Form
          </Button>
        </>
      )}
    </>
  );
};

import { useQuery } from "@apollo/client";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  AccordionItem,
  AccordionPanel,
  VStack,
  Accordion,
  AccordionButton,
  Button,
  Text,
  Checkbox,
  Skeleton,
  AccordionIcon,
  Flex,
} from "@chakra-ui/react";
import { useHookstate } from "@hookstate/core";
import React, { useEffect, useState } from "react";
import { GetTermsConditions } from "../../../../apollo/termsConditionsQueries";
import { globalState } from "../../../../state/store";
import { TermsAndConditions } from "../../interfaces";

export function SelectTermsConditions() {
  //State to carry all terms and conditions
  const [terms, setTerms] = useState<TermsAndConditions[]>([]);
  //State to carry selected terms and conditions only
  const [selectedTerms, setSelectedTerms] = useState<TermsAndConditions[]>([]);
  //get organization id
  const user = useHookstate(globalState.user);

  //Get all terms and  conditions from server
  const {
    loading: termsLoading,
    error: termsError,
    data: termsData,
  } = useQuery(GetTermsConditions, {
    variables: { orgId: user!.value?.organization?.id },
  });

  //setting terms and conditions coming from the server to terms state,
  //setting terms and conditions that are required (mandatory) to selectedTerms state
  useEffect(() => {
    if (termsData) {
      const formattedData = termsData.termsAndConditions.lookupByOrg.map(
        (term) => ({
          id: term.id,
          title: term.title,
          description: term.description,
          orgId: term.orgId,
          isRequired: term.isRequired,
        })
      );
      setTerms(formattedData);
      setSelectedTerms(
        formattedData.filter((term) => term.isRequired).map((term) => term)
      );
    }
  }, [termsData]);

  //handle check/uncheck and store selected terms to selectedTerms state
  const handleCheckboxChange = (value, term) => {
    const newCheckedTerms = [...selectedTerms];

    if (value) {
      // Add the term to the selectedTerms array if checked
      newCheckedTerms.push(term);
    } else {
      // Remove the term from the selectedTerms array if unchecked
      const termIndex = newCheckedTerms.findIndex(
        (selectedTerm) => selectedTerm === term
      );
      if (termIndex !== -1) {
        newCheckedTerms.splice(termIndex, 1);
      }
    }
    setSelectedTerms(newCheckedTerms);
  };

  return (
    <Box width='100%' marginBottom='16px'>
      <Skeleton
        height='auto'
        isLoaded={!termsLoading}
        startColor='greys.100'
        endColor='greys.400'
      >
        <Accordion allowToggle defaultIndex={[0]}>
          <AccordionItem>
            <AccordionButton>
              <Flex as='span' flex='1' justifyContent='space-between'>
                Select Terms and Conditions
                <Text marginRight='8px' color='gray.500'>
                  Selected ({selectedTerms.length})
                </Text>
              </Flex>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <VStack alignItems={"left"} marginBottom='8px'>
                {terms.length &&
                  terms.map((term, index) => (
                    <Checkbox
                      key={index}
                      isDisabled={term.isRequired}
                      isChecked={selectedTerms.includes(term)}
                      colorScheme={"gray"}
                      onChange={(e) =>
                        handleCheckboxChange(e.target.checked, term)
                      }
                    >
                      {term.title}
                    </Checkbox>
                  ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Skeleton>
    </Box>
  );
}

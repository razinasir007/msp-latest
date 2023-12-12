import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  FormControl,
  FormErrorMessage,
  Grid,
  GridItem,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { LabeledInput } from "../shared/labeledInput";
import { Formik, Form, Field } from "formik";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { useFirebaseAuth } from "../../auth";
import { ROUTE_PATHS } from "../../../constants";

const mainLogo = require("../../../assets/mspMain.png");
const mainCardStyle = {
  padding: "0",
  width: "45%",
  borderRadius: "4px",
  borderColor: "greys.300",
  marginTop: "45px",
};

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ResetPassword() {
  const { sendPasswordResetEmail } = useFirebaseAuth && useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  return (
    <Box>
      <Grid
        templateAreas={`"header"
                "content"
                "footer"`}
        gridTemplateRows={"75px 1fr 61px"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          <Center mt='30px'>
            <img width='105.5px' height='52px' src={mainLogo} />
          </Center>
        </GridItem>
        <GridItem>
          <Center>
            <Card variant='outline' style={mainCardStyle}>
              <CardBody padding='16px'>
                <Stack alignItems='center' mt='20px'>
                  <Text fontSize='18px' fontWeight='600' lineHeight='22px'>
                    Reset Password
                  </Text>
                </Stack>
                <Formik
                  initialValues={{ email: "" }}
                  validationSchema={validationSchema}
                  onSubmit={(values) => {
                    setLoading(true);
                    sendPasswordResetEmail &&
                      sendPasswordResetEmail(values.email)
                        .then(() => {
                          // Handle successful password  reset
                          setLoading(false);
                          setEmailSent(true);
                        })
                        .catch(() => {
                          // Handle password  reset error
                          setEmailSent(false);
                          setLoading(false);
                        });
                  }}
                >
                  <Form>
                    <VStack width='100%' spacing='15px'>
                      <Text mt='16px' fontSize='15px' lineHeight='18px'>
                        Write your email to get instructions on how to reset
                        your password
                      </Text>
                      <Field name='email'>
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={form.errors.email && form.touched.email}
                          >
                            <LabeledInput
                              containerHeight='55px'
                              label='Email'
                              {...field}
                              labelSize='p5'
                              type='email'
                              placeholder='Email...'
                            />
                            <FormErrorMessage mt='16px'>
                              {form.errors.email}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      {!emailSent ? (
                        <Button
                          isLoading={loading}
                          type='submit'
                          mt='15px'
                          w='100%'
                          variant='solid'
                        >
                          Send Email
                        </Button>
                      ) : (
                        <VStack spacing='16px' width='100%'>
                          <Button
                            mt='15px'
                            w='100%'
                            variant='solid'
                            leftIcon={<CheckIcon />}
                          >
                            Email sent!
                          </Button>
                          <Text fontSize='15px' lineHeight='18px'>
                            Check your inbox
                          </Text>
                        </VStack>
                      )}
                    </VStack>
                  </Form>
                </Formik>
              </CardBody>
            </Card>
          </Center>
        </GridItem>
        <Stack mt='20px'>
          <Center>
            <Button
              leftIcon={<MdOutlineKeyboardBackspace />}
              _hover={{ backgroundColor: "#EAE8E9" }}
              variant='ghost'
              onClick={() => {
                navigate(ROUTE_PATHS.SIGN_IN);
              }}
            >
              Back to Log In
            </Button>
          </Center>
        </Stack>
      </Grid>
    </Box>
  );
}

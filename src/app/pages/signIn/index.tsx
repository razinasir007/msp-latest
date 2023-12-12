// Import FirebaseAuth and firebase.
import React, { useState } from "react";
import {
  Box,
  Grid,
  Text,
  GridItem,
  Button,
  Card,
  Checkbox,
  CardBody,
  Stack,
  VStack,
  FormErrorMessage,
  FormControl,
  HStack,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { Center } from "@chakra-ui/layout";
import { LabeledInput } from "../../components/shared/labeledInput";
import { useNavigate } from "react-router";
import "firebase/compat/auth";
import { Formik, Form, Field } from "formik";
import { validationSchema } from "./validationSchema";
import { useFirebaseAuth } from "../../auth";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { ROUTE_PATHS } from "../../../constants";

const mainLogo = require("../../../assets/mspMain.png");
const mainCardStyle = {
  padding: "0",
  width: "45%",
  borderRadius: "4px",
  borderColor: "greys.300",
  marginTop: "45px",
};

export default function SignIn() {
  const { signInWithEmailPassword, signInWithGoogle, authLoading } =
    useFirebaseAuth && useFirebaseAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <Box>
      {authLoading ? (
        <Center width='100%' height='100vh'>
          <VStack alignItems='center' justifyContent='center'>
            <Spinner color='black' />
            <Text fontSize='p5'>Signing you in... </Text>
          </VStack>
        </Center>
      ) : (
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
                      Log into your account
                    </Text>
                  </Stack>
                  <Formik
                    initialValues={{ email: "", password: "" }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                      setLoading(true);
                      signInWithEmailPassword &&
                        signInWithEmailPassword(values.email, values.password)
                          .then((userCredential) => {
                            // Handle successful login
                            setLoading(false);
                          })
                          .catch((error) => {
                            // Handle login error
                            setLoading(false);
                          });
                    }}
                  >
                    <Form>
                      <VStack width='100%' spacing='15px'>
                        <Field name='email'>
                          {({ field, form }) => (
                            <FormControl
                              isInvalid={
                                form.errors.email && form.touched.email
                              }
                            >
                              <LabeledInput
                                containerHeight='55px'
                                label='Email'
                                {...field}
                                labelSize='p5'
                                type='email'
                                placeholder='Email...'
                              />
                              <FormErrorMessage>
                                {form.errors.email}
                              </FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                        <Field name='password'>
                          {({ field, form }) => (
                            <FormControl
                              isInvalid={
                                form.errors.password && form.touched.password
                              }
                            >
                              <LabeledInput
                                containerHeight='55px'
                                label='Password'
                                labelSize='p5'
                                placeholder='Password...'
                                type={showPassword ? "text" : "password"} // Use 'text' if showPassword is true, otherwise 'password'
                                {...field}
                                rightIcon={
                                  showPassword ? (
                                    <ViewOffIcon
                                      onClick={() => setShowPassword(false)}
                                    />
                                  ) : (
                                    <ViewIcon
                                      onClick={() => setShowPassword(true)}
                                    />
                                  )
                                }
                              />
                              <FormErrorMessage>
                                {form.errors.password}
                              </FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                      </VStack>
                      <Box mt='20px'>
                        <Checkbox size='md' colorScheme='green'>
                          <Text fontSize='p5'> Remember me </Text>
                        </Checkbox>
                      </Box>
                      <VStack>
                        <Button
                          isLoading={
                            loading
                            // || authLoading
                          }
                          type='submit'
                          mt='15px'
                          w='100%'
                          variant='solid'
                        >
                          Log In
                        </Button>
                        {/* <Button
                        onClick={() => {
                          navigate(
                            "/signUp?email=saadtariq1995.st@gmail.com&orgId=b335230f-9b33-43f2-8b99-b92bf2b31007"
                          );
                        }}
                      >
                        Employee OnBoarding
                      </Button> */}
                        <Text fontSize='15px'>Or</Text>
                        <Button
                          isLoading={
                            loading
                            // || authLoading
                          }
                          onClick={() => {
                            setLoading(true);
                            return (
                              signInWithGoogle &&
                              signInWithGoogle()
                                .then(() => {
                                  // Handle successful login
                                  setLoading(false);
                                })
                                .catch(() => {
                                  // Handle login error
                                  setLoading(false);
                                })
                            );
                          }}
                          variant='outline'
                          w='100%'
                          leftIcon={<FcGoogle />}
                        >
                          Sign In with Google
                        </Button>
                      </VStack>
                    </Form>
                  </Formik>
                </CardBody>
              </Card>
            </Center>
          </GridItem>
          <Center>
            <HStack justifyContent='space-between' mt='20px' width='45%'>
              <Text fontSize='15px' lineHeight='18px'>
                Don't have an account?{" "}
                <span
                  onClick={() => navigate(ROUTE_PATHS.SIGN_UP)}
                  style={{ color: "#4480E5", cursor: "pointer" }}
                >
                  Sign Up
                </span>
              </Text>
              <Link
                color='#4480E5'
                fontSize='15px'
                lineHeight='18px'
                onClick={() => navigate(ROUTE_PATHS.RESET_PASSWORD)}
              >
                Forgot Password?
              </Link>
            </HStack>
          </Center>
        </Grid>
      )}
    </Box>
  );
}

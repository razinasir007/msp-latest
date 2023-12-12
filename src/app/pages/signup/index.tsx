// Import FirebaseAuth and firebase.
import React, { useEffect, useState } from "react";

import {
  Box,
  Grid,
  Text,
  GridItem,
  Button,
  Card,
  CardBody,
  HStack,
  Stack,
  VStack,
  CardHeader,
  Flex,
} from "@chakra-ui/react";
import { Center } from "@chakra-ui/layout";
import { LabeledInput } from "../../components/shared/labeledInput";
import { useNavigate } from "react-router";
import { useFirebaseAuth } from "../../auth";

import Swal from "sweetalert2";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import { FcGoogle } from "react-icons/fc";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { DecryptData, ROUTE_PATHS } from "../../../constants";

const logo = require("../../../assets/Check.png");
const errorImg = require("../../../assets/errorIcon.png");
const mainLogo = require("../../../assets/mspMain.png");

const mainCardStyle = {
  padding: "0",
  width: "45%",
  borderRadius: "4px",
  borderColor: "greys.300",
  marginTop: "25px",
  marginBottom: "10px",
};

export default function SignUp() {
  const { signUpWithEmailPassword, signInWithGoogle } =
    useFirebaseAuth && useFirebaseAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialCharError, setspecialCharError] = useState("");
  const [minPassErr, setminPassErr] = useState("");
  const [uppercaseErr, setuppercaseErr] = useState("");
  const [lowercaseErr, setlowercaseErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  //redirected to employee sign up from email invite
  const invitedEmail = new URLSearchParams(window.location.search).get("email");
  const invitingOrg = new URLSearchParams(window.location.search).get("orgId");
  const isClient = new URLSearchParams(window.location.search).get("client");
  const clientEmail = new URLSearchParams(window.location.search).get(
    "clientEmail"
  );

  useEffect(() => {
    if (invitedEmail) setEmail(invitedEmail);
  }, [invitedEmail]);

  useEffect(() => {
    if (clientEmail) setEmail(clientEmail);
  }, [clientEmail]);

  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const item = event.target.value;
    setPassword(item);
    const uppercaseRegExp = /(?=.*?[A-Z])/;
    const lowercaseRegExp = /(?=.*?[a-z])/;
    const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;
    const minLengthRegExp = /.{8,}/;

    const uppercasePassword = uppercaseRegExp.test(item);
    const lowercasePassword = lowercaseRegExp.test(item);
    const specialCharPassword = specialCharRegExp.test(item);
    const minLengthPassword = minLengthRegExp.test(item);

    if (!uppercasePassword) {
      setuppercaseErr("uppercase");
    } else {
      setuppercaseErr("");
    }

    if (!lowercasePassword) {
      setlowercaseErr("lowercase");
    } else {
      setlowercaseErr("");
    }

    if (!specialCharPassword) {
      setspecialCharError("special");
    } else {
      setspecialCharError("");
    }

    if (!minLengthPassword) {
      setminPassErr("minpass");
    } else {
      setminPassErr("");
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (
      minPassErr === "" &&
      specialCharError === "" &&
      uppercaseErr === "" &&
      lowercaseErr === ""
    ) {
      setLoading(true);
      signUpWithEmailPassword(email, password)
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
    }
  };

  const ListItems = (props) => {
    const { child, ...rest } = props;
    return (
      <HStack as='li' spacing='7px' {...rest}>
        <img width='15px' height='15px' src={props.img} />
        <Text size='10px' fontWeight='400'>
          {props.text}
        </Text>
      </HStack>
    );
  };

  return (
    <Center flexDirection={"column"} marginTop={"50px"}>
      <Center height={"75px"} padding={"24px 24px 16px"}>
        <img width='105.5px' height='52px' src={mainLogo} />
      </Center>
      <Card variant='outline' style={mainCardStyle}>
        <CardBody>
          <VStack width='100%' spacing='15px'>
            <Text fontSize='18px' fontWeight='600' lineHeight='22px'>
              Create your account
            </Text>
            <form onSubmit={handleSubmitForm} style={{ width: "100%" }}>
              <VStack width='100%' spacing='15px' alignContent={"flex-start"}>
                <LabeledInput
                  containerHeight='55px'
                  label='Email'
                  labelSize='p5'
                  type='email'
                  placeholder='Email...'
                  name='email'
                  required={true}
                  value={
                    isClient === "true" && clientEmail !== null
                      ? clientEmail
                      : invitedEmail
                      ? invitedEmail
                      : email
                  }
                  isReadOnly={clientEmail || invitedEmail ? true : false}
                  onChange={onEmailChange}
                />
                <LabeledInput
                  containerHeight='55px'
                  label='Password'
                  labelSize='p5'
                  placeholder='Password...'
                  name='password'
                  type={showPassword ? "text" : "password"} // Use 'text' if showPassword is true, otherwise 'password'
                  rightIcon={
                    showPassword ? (
                      <ViewOffIcon onClick={() => setShowPassword(false)} />
                    ) : (
                      <ViewIcon onClick={() => setShowPassword(true)} />
                    )
                  }
                  required={true}
                  onChange={onPasswordChange}
                />
                <Box>
                  {password !== "" ? (
                    <Stack as='ul' spacing='10px' pt='30px' mb='20px'>
                      <ListItems
                        img={minPassErr === "minpass" ? errorImg : logo}
                        text='At least 8 characters'
                      />
                      <ListItems
                        img={lowercaseErr === "lowercase" ? errorImg : logo}
                        text='One lowercase character'
                      />
                      <ListItems
                        img={uppercaseErr === "uppercase" ? errorImg : logo}
                        text='One uppercase character'
                      />
                      <ListItems
                        img={specialCharError === "special" ? errorImg : logo}
                        text='One special character'
                      />
                    </Stack>
                  ) : (
                    ""
                  )}
                </Box>
                <Button
                  isLoading={loading}
                  type='submit'
                  w='100%'
                  variant='solid'
                >
                  Sign Up
                </Button>
                {invitedEmail && invitingOrg && (
                  <Center flexDirection={"column"} width='100%'>
                    <Text fontSize='15px'>Or</Text>
                    <Button
                      isLoading={loading}
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
                      Sign Up using Google
                    </Button>
                  </Center>
                )}
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
      <Text fontSize='15px'>
        Already have an account?{" "}
        {isClient === "true" ? (
          <span
            // onClick={() => navigate(ROUTE_PATHS.SIGN_IN)}
            style={{ color: "#4480E5", cursor: "pointer" }}
          >
            Log In As Client
          </span>
        ) : (
          <span
            onClick={() => navigate(ROUTE_PATHS.SIGN_IN)}
            style={{ color: "#4480E5", cursor: "pointer" }}
          >
            Log In
          </span>
        )}
      </Text>
    </Center>
  );
}

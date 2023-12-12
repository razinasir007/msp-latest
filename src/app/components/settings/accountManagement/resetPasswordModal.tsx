import React, { useContext, useEffect, useState } from "react";
import {
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
  Box,
  Stack,
  HStack,
} from "@chakra-ui/react";
import { LabeledInput } from "../../shared/labeledInput";
import { ViewOffIcon, ViewIcon } from "@chakra-ui/icons";
import { ReauthenticateUser } from "./reauthenticateUser";
import { useFirebaseAuth } from "../../../auth";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import Swal from "sweetalert2";
import { UserPermissions } from "../../../routes/permissionGuard";
const logo = require("../../../../assets/Check.png");
const errorImg = require("../../../../assets/errorIcon.png");

export function ResetPasswordModal() {
  const { userPermissions } = useContext(UserPermissions);
  //to get user email
  const user = useHookstate(globalState.user);

  //for modal open and close
  const { isOpen, onOpen, onClose } = useDisclosure();
  //contains the new password
  const [password, setPassword] = useState("");
  //contains the new passsword for confirmation
  const [confirmPassword, setConfirmPassword] = useState("");
  //to tell the user if the confurmPassword matches with the new password
  const [passwordMatches, setPasswordMatches] = useState<any>();
  //for password complexity
  const [specialCharError, setspecialCharError] = useState("");
  const [minPassErr, setminPassErr] = useState("");
  const [uppercaseErr, setuppercaseErr] = useState("");
  const [lowercaseErr, setlowercaseErr] = useState("");
  //to show/hide password
  const [showPassword, setShowPassword] = useState(false);
  //to show/hide confirm password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  //for loader on buttons
  const [loading, setLoading] = useState(false);
  //contains user credentials for reauthentication
  const [userCredentials, setUserCredentials] = useState({
    email: user!.value!.email,
    password: "",
  });
  //to switch between old email & password (for reauthentication) inputs modal and new password (for update password) input model
  const [reauthenticate, setReautheticate] = useState(true);

  //getting reauthenticateWithCredential, updatePassword functions from auth
  const { reauthenticateWithCredential, updatePassword } =
    useFirebaseAuth && useFirebaseAuth();

  //to revert back states to their default values onOpen of modal
  useEffect(() => {
    if (isOpen) {
      setReautheticate(true);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setPasswordMatches(null);
      setPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  //this function handles password complexity and setting the password state
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

  //to handle password (new password and confirm password) matching
  const onConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.value === password) {
      setPasswordMatches(true);
      setConfirmPassword(event.target.value);
    } else if (event.target.value !== password) {
      setPasswordMatches(false);
    } else if (event.target.value === "" && password === "") {
      setPasswordMatches(null);
    }
  };

  //complexity items
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

  //handle sumit form (all the required checks and firebase's updatePassword function call)
  const handleSubmitForm = (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      minPassErr === "" &&
      specialCharError === "" &&
      uppercaseErr === "" &&
      lowercaseErr === ""
    ) {
      if (password === confirmPassword) {
        updatePassword &&
          updatePassword(password)
            .then(() => {
              setLoading(false);
              onClose();
              Swal.fire({
                icon: "success",
                title: "Update Password Successfull",
                text: "Password reset was successful.",
              });
            })
            .catch(() => {
              console.log("error during resetting");
            });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error during Password Resetting!",
          text: "Your passwords do not match.",
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Error during Password Resetting!",
        text: "Your passwords are not complex enough.",
      });
    }
  };

  return (
    <>
      <Text
        width='fit-content'
        cursor='pointer'
        onClick={()=>{
            userPermissions.fullAccess || userPermissions.edit ? onOpen() :  Swal.fire({icon: "error", title: "Not Allowed", text: "You cannot make changes to this page."});
          }}
        fontSize='p6'
        fontWeight='normal'
        paddingTop='4px'
        color='state.info'
      >
        Reset Password
      </Text>
      <Modal size='lg' isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius='4px'>
          <form onSubmit={handleSubmitForm} style={{ width: "100%" }}>
            <ModalHeader
              fontSize='h5'
              lineHeight='28px'
              padding='16px'
              borderBottom='1px'
              borderColor=' greys.300'
            >
              Create New Password
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody padding='16px'>
              {reauthenticate ? (
                <ReauthenticateUser
                  userCredentials={userCredentials}
                  setUserCredentials={setUserCredentials}
                />
              ) : (
                <>
                  <Text
                    fontSize='p4'
                    fontWeight='normal'
                    lineHeight='20px'
                    paddingBottom='16px'
                  >
                    Your new password must be different from the previous used
                    passwords.
                  </Text>
                  <LabeledInput
                    label='New Password'
                    labelSize='p5'
                    placeholder='Password...'
                    name='password'
                    type={showPassword ? "text" : "password"} // Use 'text' if showPassword is true, otherwise 'password'
                    required={true}
                    onChange={onPasswordChange}
                    rightIcon={
                      showPassword ? (
                        <ViewOffIcon onClick={() => setShowPassword(false)} />
                      ) : (
                        <ViewIcon onClick={() => setShowPassword(true)} />
                      )
                    }
                  />
                  <Text
                    fontSize='p6'
                    fontWeight='normal'
                    lineHeight='18px'
                    color='#8C8C8C'
                    paddingBottom='8px'
                  >
                    Must be at least 8 characters.
                  </Text>
                  <Box>
                    {password !== "" ? (
                      <Stack as='ul' spacing='10px' pt='8px' mb='20px'>
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
                  <LabeledInput
                    label='Confirm Password'
                    labelSize='p5'
                    placeholder='Confirm Password...'
                    name='confirmPassword'
                    type={showConfirmPassword ? "text" : "password"} // Use 'text' if showPassword is true, otherwise 'password'
                    required={true}
                    onChange={onConfirmPasswordChange}
                    rightIcon={
                      showConfirmPassword ? (
                        <ViewOffIcon
                          onClick={() => setShowConfirmPassword(false)}
                        />
                      ) : (
                        <ViewIcon
                          onClick={() => setShowConfirmPassword(true)}
                        />
                      )
                    }
                  />
                  <Text
                    fontSize='p6'
                    fontWeight='normal'
                    lineHeight='18px'
                    color='#8C8C8C'
                  >
                    Both passwords must match.
                  </Text>
                  {passwordMatches === true ? (
                    <Text
                      fontSize='p6'
                      fontWeight='normal'
                      lineHeight='18px'
                      color='green'
                    >
                      Passwords match
                    </Text>
                  ) : passwordMatches === false ? (
                    <Text
                      fontSize='p6'
                      fontWeight='normal'
                      lineHeight='18px'
                      color='red'
                    >
                      Password does not match
                    </Text>
                  ) : (
                    <></>
                  )}
                </>
              )}
            </ModalBody>

            <ModalFooter
              padding='10px 16px'
              borderTop='1px'
              borderColor=' greys.300'
            >
              {reauthenticate ? (
                <Button
                  size='sm'
                  width='100%'
                  isLoading={loading}
                  onClick={() => {
                    setLoading(true);
                    reauthenticateWithCredential &&
                      reauthenticateWithCredential(userCredentials)
                        .then(() => {
                          setLoading(false);
                          setReautheticate(false);
                        })
                        .catch(() => {
                          setReautheticate(true);
                          setLoading(false);
                          onClose();
                        });
                  }}
                >
                  Confirm
                </Button>
              ) : (
                <Button
                  size='sm'
                  width='100%'
                  type='submit'
                  isLoading={loading}
                >
                  Reset Password
                </Button>
              )}
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}

import React, { useState } from "react";
import { Text } from "@chakra-ui/react";
import { LabeledInput } from "../../shared/labeledInput";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

interface authenticateProps {
  userCredentials: any;
  setUserCredentials: any;
}

export const ReauthenticateUser = ({
  userCredentials,
  setUserCredentials,
}: authenticateProps) => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  return (
    <>
      <Text
        fontSize='p4'
        fontWeight='normal'
        lineHeight='20px'
        paddingBottom='16px'
      >
        Type in your old email and password.
      </Text>
      <LabeledInput
        label='Email'
        labelSize='p5'
        placeholder='Email...'
        name='email'
        type='email'
        value={userCredentials.email}
        isReadOnly
      />
      <LabeledInput
        label='Password'
        labelSize='p5'
        placeholder='Password...'
        name='password'
        type={showOldPassword ? "text" : "password"} // Use 'text' if showPassword is true, otherwise 'password'
        required={true}
        onChange={(event) => {
          setUserCredentials({
            ...userCredentials,
            password: event.target.value,
          });
        }}
        rightIcon={
          showOldPassword ? (
            <ViewOffIcon onClick={() => setShowOldPassword(false)} />
          ) : (
            <ViewIcon onClick={() => setShowOldPassword(true)} />
          )
        }
      />
    </>
  );
};

// Import FirebaseAuth and firebase.
import React from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { Card, CardBody } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";
import { useFirebaseAuth } from "../../auth";
import { appConfig } from "../../../config";
import { ROUTE_PATHS } from "../../../constants";

// Configure Firebase.
const config = {
  apiKey: appConfig.FIREBASE_API_KEY,
  authDomain: appConfig.FIREBASE_AUTH_DOMAIN,
};

firebase.initializeApp(config);

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: "popup",
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

export default function Login(props) {
  const { user } = useFirebaseAuth();
  if (user) {
    return <Navigate to={`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.DASHBOARD}`} />;
  }
  return (
    <div className='container h-100'>
      <div className='row h-100 justify-content-center align-items-center align-middle'>
        <Card
          variant={"filled"}
          sx={{ position: "relative", padding: 10, width: 600, top: 200 }}
        >
          <CardBody>
            <StyledFirebaseAuth
              uiConfig={uiConfig}
              firebaseAuth={firebase.auth()}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { appConfig } from "../../config";

const firebaseConfig = {
  apiKey: appConfig.FIREBASE_API_KEY,
  authDomain: appConfig.FIREBASE_AUTH_DOMAIN,
};

firebase.initializeApp(firebaseConfig);

export default firebase;

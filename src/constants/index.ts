import { FieldDatatypeEnum } from "../../src/apollo/gql-types/graphql";
import { AES, enc } from "crypto-js";
import { UploadedPhoto } from "../state/interfaces";
import { appConfig } from "../config";
import { ClientRole } from "./enums";
const StripeImg = require("../assets/stripe.png");
const PaypalImg = require("../assets/paypal.png");
const SquareImg = require("../assets/square1.png");

export const StatusOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

export const regexStrConst = {
  //Required format: johndoe@mail.com
  emailRegex: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9.]+\.[a-zA-Z]+$/,
  // eslint-disable-next-line no-useless-escape
  phoneNumberRegex: /^\+[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
  //Requirements: min. char. limit = 8, upper and lower case alphanumeric
  // eslint-disable-next-line no-useless-escape
  passwordRegex:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{7,})/,
};

export const tagsOptions = [
  {
    name: "All",
  },
  {
    name: "Edited",
  },
  {
    name: "Selected for purchase",
  },
  {
    name: "Favorites",
  },
];
export let appliedFilter: {
  role: null | { value: null | number; label: string };
  status: null | { value: null | boolean; label: string };
} = {
  role: null,
  status: null,
};

export const DatatypeOptions = Object.values(FieldDatatypeEnum).map(
  (datatype) => ({
    value: datatype,
    label: datatype.charAt(0) + datatype.slice(1).toLowerCase(),
  })
);

export const EncryptData = (params) => {
  const cipherText = AES.encrypt(params, appConfig.SECRET_KEY);
  return encodeURIComponent(cipherText.toString());
};

export const DecryptData = (params) => {
  const bytes = AES.decrypt(decodeURIComponent(params), appConfig.SECRET_KEY);
  const decrypted = bytes.toString(enc.Utf8);
  return decrypted;
};

// For extracting the folder names and images associated with that folder from nested folder structure for file (for core tool)
export const extractImagesByFolders = (images) => {
  const folders = {};
  const rootImages: UploadedPhoto[] = [];

  images.forEach((image) => {
    const path = image.path;
    const pathParts = path.split("/");

    if (pathParts.length === 1) {
      // Image belongs to the root folder
      rootImages.push({
        name: pathParts[0],
        base64: image.base64,
        thumbnailBase64: image.thumbnailBase64,
        resizedBase64: image.resizedBase64,
        file: image.file,
        id: image.id,
        path: path,
      });
    } else {
      let currentFolder: any = folders;

      for (let i = 1; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        if (!currentFolder[folderName]) {
          currentFolder[folderName] = {
            images: [],
          };
        }
        currentFolder = currentFolder[folderName];
      }

      const fileName = pathParts[pathParts.length - 1];
      if (!currentFolder.images) {
        currentFolder.images = [];
      }
      currentFolder.images.push({
        name: fileName,
        base64: image.base64,
        thumbnailBase64: image.thumbnailBase64,
        resizedBase64: image.resizedBase64,
        file: image.file,
        id: image.id,
        path: path,
      });
    }
  });
  return {
    root: {
      images: rootImages,
    },
    ...folders,
  };
};

// Convert base 64 to file object

export function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// Convert File Object to Base64

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Unable to read file as Base64.'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}


//Type of terms and conditions
export const termsTypeOptions = [
  {
    value: `APPOINTMENT_TERMS`,
    label: "Appointments",
  },
  {
    value: `STUDIO_POLICIES`,
    label: "Studio",
  },
  {
    value: `ORDER_TERMS`,
    label: "Orders",
  },
];

// shorten lengthy ids 
export function shortenIds(hexString, range) {
  // Convert hexadecimal to decimal
  const decimalNumber = parseInt(hexString, 16);

  // Take the remainder when divided by the range
  const shortenedNumber = decimalNumber % range;

  // Optionally, convert back to hexadecimal
  const shortenedHex = shortenedNumber.toString(16);

  return shortenedHex;
}

export const reminderDuration = [
  {
    value: `30`,
    label: "30 Mins",
  },
  {
    value: `45`,
    label: "45 Mins",
  },
  {
    value: `60`,
    label: "1 Hour",
  },
  {
    value: `120`,
    label: "2 Hours",
  },
  {
    value: `180`,
    label: "3 Hours",
  },
  {
    value: `1440`,
    label: "1 Day",
  },
  {
    value: `2880`,
    label: "2 Days",
  },
  {
    value: `4320`,
    label: "3 Days",
  },
  {
    value: `10080`,
    label: "1 Week",
  },
  {
    value: `20160`,
    label: "2 Weeks",
  },
  {
    value: `30240`,
    label: "3 Weeks",
  },
];

//intents

export const Intents = {
  paymentIntent: 'pi',
  setupIntent: 'seti'
}


//STRIPE APPEARENCE
export const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#121212",
    colorBackground: "#F7F5F0",
    fontFamily: "Poppins, sans-serif",
    borderRadius: "4px",
  },
};

// Routes name
export const ROUTE_PATHS = {
  HOME: '/',
  CUSTOM_FORM: '/form',
  IMAGE_GALLERY: '/mystudio/imageGalleryView',
  PAYMENT_PLANS: '/paymentPlans',
  ONBOARDING: '/onboarding',
  EMPLOYEE_ONBOARDING: '/employeeOnboarding',
  LOGIN: '/login',
  SIGN_UP: '/signUp',
  SIGN_IN: '/signIn',
  RESET_PASSWORD: '/resetPassword',
  LAYOUT: '/mystudio',
  DASHBOARD: 'dashboard',
  TOOL: 'tool',
  CALENDAR: 'calendar',
  SALES: 'sales',
  PRODUCTION: 'production',
  CONTACTS: 'contacts',
  NOTIFICATIONS: 'notifications',
  CLIENT_VIEW: 'clientView',
  CLIENT_VIEW_ORDER: 'clientViewOrder',
  SETTINGS: 'settings',
  ACCOUNT: 'account',
  ORGANIZATION: 'organization',
  USER: 'user',
  PROJECTOR: 'projector',
  CUSTOMER: 'customer',
  PAYMENTS: 'payments',
  PRIVACY: 'privacy',
  PRODUCTS: 'products',
  PACKAGES: 'packages',
  DOCUMENTS: 'documents',
  TERMS_CONDITIONS: 'termsConditions',
  APIS: 'apis',
  ROOMVIEW: 'roomview',
  WEBHOOKS: 'webhooks',
};

export const paymentSelectionArray = [
  { name: "Stripe", image: StripeImg },
  { name: "PayPal", image: PaypalImg },
  { name: "Square", image: SquareImg }
];
export const rowData = [
  { name: "Steven C", time: "12:30PM", number: 35000 },
  { name: "Bill T", time: "1:30PM", number: 32000 },
  { name: "Austin Swwwww", time: "2:00AM", number: 72000 },
  { name: "Austin S", time: "2:00AM", number: 72000 },
  { name: "Austin S", time: "2:00AM", number: 72000 },
  { name: "Austin S", time: "2:00AM", number: 72000 },
  { name: "Austin S", time: "2:00AM", number: 72000 },
  { name: "Austin S", time: "2:00AM", number: 72000 },
  { name: "Austin Swwwww", time: "2:00AM", number: 72000 },
  { name: "Austin Swwwww", time: "2:00AM", number: 72000 },
  { name: "Austin Swwwww", time: "2:00AM", number: 72000 },
  { name: "Austin Swwwww", time: "2:00AM", number: 72000 },
  { name: "Austin Swwwww", time: "2:00AM", number: 72000 },
  { name: "Austin Swwwww", time: "2:00AM", number: 72000 },
  { name: "Austin Swwwww", time: "2:00AM", number: 72000 },
  { name: "Austin Swwwww", time: "2:00AM", number: 72000 },
  { name: "Austin S", time: "2:00AM", number: 72000 },
  { name: "Austin S", time: "2:00AM", number: 72000 },
  { name: "Austin S", time: "2:00AM", number: 72000 },
  { name: "Austin S", time: "2:00AM", number: 72000 },
];
export const SLIDESHOW_INTERVAL: number = 3500;

export const CLIENT_ROLE = {
  id: ClientRole.CLIENT_ROLE_ID,
  name: ClientRole.CLIENT,
  description: "Client Only",
}

export const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};
export const actionTypes = [
  { name: "Appointment.CREATED", value: "appointmentCreated" },
  { name: "Appointment.UPDATED", value: "appointmentUpdated" },
  { name: "Appointment.DELETED", value: "appointmentDeleted" },
  // Add more actions as needed
];

export const defaultWidths = [1, 2, 3];
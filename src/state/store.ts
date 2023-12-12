import { hookstate, State, useHookstate } from "@hookstate/core";
import { v4 as uuidv4 } from "uuid";
import {
  RoomViewState,
  defaultValue as defaultRoomViewState,
} from "./roomViewState";
import { defaultValue as defaultProductSelectionState } from "./productSelectionState";
import {
  AppState,
  CustomRoomDetails,
  LocationScreenAndSettings,
  Product,
  RoomViewImages,
  RoomViewProducts,
  UploadedPhoto,
  UserProfile,
} from "./interfaces";
import {
  setInputValueThumbnailLabels,
  getInputValueThumbnailLabels,
  setInputValueImageLabels,
  getInputValueImageLabels,
  setFilenameExtension,
  getFilenameExtension,
} from "./projectorSettingsState";

import {
  setInputValueImageBorders,
  getInputValueImageBorders,
  setLayoutsOpening,
  setLayoutsThumbnails,
  setFramesOpening,
  getLayoutsOpening,
  getFramesOpening,
  getLayoutsThumbnails,
  setOpacity,
  getOpacity,
  getSize,
  setSize,
  setToggle,
  getToggle,
  setBackgroundColorForImage,
  getBackgroundColorForImage,
} from "./bordersAndBackgroundsState";
import {
  removeAudio,
  addAudios,
  getAudios,
  setSound,
  getSound,
  setContent,
  getContent,
  setWatermark,
  getWatermarkText,
} from "./slideshow";
import {
  defaultValuesForbordersAndBackgrounds,
  defaultValuesForScreenCalibrations,
  defaultValuesForSlideShow,
} from "./interfaces/screenPojectorInterface";

import {
  addImages,
  addOriImages,
  addPresentationImages,
  getImages,
  getOriImages,
  getPresentationImages,
  updateImage,
  updateOriImage,
  updatePresentationImage,
  setSelectedImages,
  getSelectedImages,
  addResizedImages,
  getResizedImages,
  addImagesForClientView,
  getClientImages,
  updateClientViewImage,
  addCopiedImage,
} from "./imagesState";

export const globalState = hookstate<AppState>({
  user: undefined,
  uploadedImages: [],
  originalImages: [],
  presentationImages: [],
  clientImages: [],
  //created by Razi
  uploadOrgImages: [],
  resizedImages: [],
  //created by Razi
  // selectedGalleryImages: [],
  selectedImages: [],
  editedImages: [],
  reminderDuration: { label: "30 Mins", value: "30" },
  watermark: "",
  locationScreenAndSettings: [],
  selectedLocationScreenAndSettings: [],
  defaultLocation: [],
  products: [],
  roomViewProducts: [],
  roomCalibrationCheck: false,
  roomViewImages: [],
  customRoomDetails: [],
  selectedCustomRoomDetails: [],
  toolCustomRooms: [],
  calibrationCheck: false,
  paymentCheck: false,
  customPaymentcheck: false,
  stripePriceId: "",
  clientDetail: [],
  selectAll: false,
  productSelection: defaultProductSelectionState,
  roomState: defaultRoomViewState,
  uploadedAudios: [],
  screenCalibrations: defaultValuesForScreenCalibrations,
  bordersAndBackgrounds: defaultValuesForbordersAndBackgrounds,
  slideShow: defaultValuesForSlideShow,
  notifications: [],
});

window["state"] = globalState;

// The following 2 functions can be exported now:
export const accessGlobalState = () => wrapState(globalState); // can be used outside of a component
export const useGlobalState = () => wrapState(useHookstate(globalState)); // needs to be used in a component

const wrapState = (state: State<AppState>) => ({
  getUserProfile: getUserProfile(state),
  setUserProfile: setUserProfile(state),
  removeImage: removeImage(state),
  //created by Razi
  removeOrgImage: removeOrgImage(state),
  deleteAllImages: deleteAllImages(state),
  addImages: addImages(state),
  addClientImages: addImagesForClientView(state),
  getClientImages: getClientImages(state),
  updateClientViewImage: updateClientViewImage(state),
  addOriImages: addOriImages(state),
  addPresentationImages: addPresentationImages(state),
  addResizedImages: addResizedImages(state),
  getResizedImages: getResizedImages(state),
  getOriImages: getOriImages(state),
  getPresentationImages: getPresentationImages(state),
  //created by razi
  addOrgImage: addOrgImage(state),
  // addImagesToGallery: addImagesToGallery(state), //created by Razi
  // getImagesForGallery: getImagesForGallery(state), //created by razi
  // created by Razi
  addLocationScrenAndSettings: addLocationScreensAndSettings(state),
  getLocationScrenAndSettings: getLocationScreensAndSettings(state),
  removeLocationScrenAndSettings: removeLocationScreensAndSettings(state),
  addSelectedLocationScrenAndSettings:
    addSelectedLocationScrenAndSettings(state),
  getSelectedLocationScrenAndSettings:
    getSelectedLocationScrenAndSettings(state),
  setDefaultLocation: setDefaultLocation(state),
  getDefaultLocation: getDefaultLocation(state),
  setCalibrationCheck: setCalibrationCheck(state),
  getCalibrationCheck: getCalibrationCheck(state),
  getImages: getImages(state),
  //created by Razi
  getOrgImages: getOrgImages(state),
  setSelectAll: setSelectAll(state),
  getSelectAll: getSelectAll(state),
  getSelectedImages: getSelectedImages(state),
  setSelectedImages: setSelectedImages(state),
  selectPhoto: selectPhoto(state),
  updateImage: updateImage(state),
  addCopiedImage: addCopiedImage(state),
  updateOriImage: updateOriImage(state),
  updatePresentationImage: updatePresentationImage(state),
  addProduct: addProduct(state),
  removeProduct: removeProduct(state),
  removeAllProducts: removeAllProducts(state),
  getAllProducts: getAllProducts(state),
  //states for Screen Callibration
  setInputValueThumbnailLabels: setInputValueThumbnailLabels(state),
  getInputValueThumbnailLabels: getInputValueThumbnailLabels(state),
  setInputValueImageLabels: setInputValueImageLabels(state),
  getInputValueImageLabels: getInputValueImageLabels(state),
  setFilenameExtension: setFilenameExtension(state),
  getFilenameExtension: getFilenameExtension(state),
  // States for Borders and Background
  setInputValueImageBorders: setInputValueImageBorders(state),
  getInputValueImageBorders: getInputValueImageBorders(state),
  setBackgroundColorForImage: setBackgroundColorForImage(state),
  getBackgroundColorForImage: getBackgroundColorForImage(state),
  setLayoutsOpening: setLayoutsOpening(state),
  getLayoutsOpening: getLayoutsOpening(state),
  setLayoutsThumbnails: setLayoutsThumbnails(state),
  getLayoutsThumbnails: getLayoutsThumbnails(state),
  setFramesOpening: setFramesOpening(state),
  getFramesOpening: getFramesOpening(state),
  setOpacity: setOpacity(state),
  getOpacity: getOpacity(state),
  setSize: setSize(state),
  getSize: getSize(state),
  setToggle: setToggle(state),
  getToggle: getToggle(state),
  //States for Slideshow
  setSound: setSound(state),
  getSound: getSound(state),
  setContent: setContent(state),
  getContent: getContent(state),
  removeAudio: removeAudio(state),
  addAudios: addAudios(state),
  getAudios: getAudios(state),
  setWatermarkText: setWatermark(state),
  getWatermarkText: getWatermarkText(state),
  //get and set notifications
  getNotifications: getNotifications(state),
  setNotifications: setNotifications(state),
  setPaymentCheck: setPaymentCheck(state),
  getPaymentCheck: getPaymentCheck(state),
  setCustomPaymentCheck: setCustomPaymentCheck(state),
  getCustomPaymentCheck: getCustomPaymentCheck(state),
  setClientDetail: setClientDetail(state),
  getClientDetail: getClientDetail(state),
  removeClientDetail: removeClientDetail(state),
  setReminderDuration: setReminderDuration(state),
  getReminderDuration: getReminderDuration(state),
  getStripePirceIdForUser: getStripePirceIdForUser(state),
  setStripePirceIdForUser: setStripePirceIdForUser(state),
  addProductToRoomView: addProductToRoomView(state),
  //NEW ADDITION FOR PRODUCT SELECTION AND ROOM VIEW REFACTOR
  addImageToRoomView: addImageToRoomView(state),
  getRoomViewProducts: getRoomViewProducts(state),
  //NEW ADDITION FOR PRODUCT SELECTION AND ROOM VIEW REFACTOR
  getRoomViewImages: getRoomViewImages(state),
  removeRoomViewProduct: removeRoomViewProduct(state),
  //NEW ADDITION FOR PRODUCT SELECTION AND ROOM VIEW REFACTOR
  removeRoomViewImage: removeRoomViewImage(state),
  addCustomRoomViewDetails: addCustomRoomViewDetails(state),
  getCustomRoomViewDetails: getCustomRoomViewDetails(state),
  removeCustomRoomViewDetails: removeCustomRoomViewDetails(state),
  selectedCustomRoomDetails: selectedCustomRoomDetails(state),
  getSelectedCustomRoomDetails: getSelectedCustomRoomDetails(state),
  setRefectchRoomCalibration: setRefectchRoomCalibration(state),
  getRefectchRoomCalibration: getRefectchRoomCalibration(state),
  setToolCustomRooms: setToolCustomRooms(state),
  getToolCustomRooms: getToolCustomRooms(state),

});

function getUserProfile(state: State<AppState>) {
  return () => state.user.get();
}
function setUserProfile(state: State<AppState>) {
  return (profile?: UserProfile) => {
    state.user.set(profile);
  };
}
function getStripePirceIdForUser(state: State<AppState>) {
  return () => state.stripePriceId.get();
}
function setStripePirceIdForUser(state: State<AppState>) {
  return (priceId) => {
    state.stripePriceId.set(priceId);
  };
}
function removeImage(state: State<AppState>) {
  return (image: UploadedPhoto) => {
    state.uploadedImages.set((previous) => {
      return previous.filter((photo) => photo.id !== image.id);
    });
    // state.selectedImages.set((selectedImages) => {
    //   const wasAdded = selectedImages.find((item) => item.id === image.id);
    //   //case 1: If the image was not selected, keep the original selection
    //   if (!wasAdded) {
    //     return [...selectedImages];
    //   }
    //   // case 2: Create a new selected array without the removed image
    //   else {
    //     return selectedImages.filter((item) => item.id !== image.id);
    //   }
    // });
  };
}

function removeLocationScreensAndSettings(state: State<AppState>) {
  return (locationScreen: LocationScreenAndSettings) => {
    state.locationScreenAndSettings.set((prev) => {
      return prev.filter((screen) => screen.id !== locationScreen.id);
    });
  };
}

function deleteAllImages(state: State<AppState>) {
  return () => {
    state.uploadedImages.set([]);
    state.originalImages.set([]);
    state.presentationImages.set([]);
  };
}

function removeClientDetail(state: State<AppState>) {
  return () => {
    state.clientDetail.set([]);
  };
}

function addLocationScreensAndSettings(state: State<AppState>) {
  return (screen) => {
    state.locationScreenAndSettings.set((prev) => [...prev, screen]);
  };
}

function addSelectedLocationScrenAndSettings(state: State<AppState>) {
  return (screen) => {
    state.selectedLocationScreenAndSettings.set(() => [screen]);
  };
}

function setDefaultLocation(state: State<AppState>) {
  return (screen) => {
    state.defaultLocation.set(() => [screen]);
  };
}
function setClientDetail(state: State<AppState>) {
  return (client) => {
    state.clientDetail.set(() => [client]);
  };
}
function setReminderDuration(state: State<AppState>) {
  return (duration) => {
    const newDuration = {
      label: duration.label,
      value: duration.value,
    };
    state.reminderDuration.set(() => newDuration);
  };
}
function getReminderDuration(state: State<AppState>) {
  return () => {
    return state.reminderDuration.get();
  };
}

// function addImages(state: State<AppState>) {
//   return (images) => {
//     state.uploadedImages.set((previous) => [...previous, ...images]);
//   };
// }

// function addOriImages(state: State<AppState>) {
//   return (images) => {
//     state.originalImages.set((previous) => [...previous, ...images]);
//   };
// }

// function addPresentationImages(state: State<AppState>) {
//   return (images) => {
//     state.presentationImages.set((previous) => [...previous, ...images]);
//   };
// }

//created by Razi
function addOrgImage(state: State<AppState>) {
  return (images) => {
    state.uploadOrgImages.set((previous) => [...previous, ...images]);
  };
}

function removeOrgImage(state: State<AppState>) {
  return (image: UploadedPhoto) => {
    state.uploadOrgImages.set((previous) => {
      return previous.filter((photo) => photo.id !== image.id);
    });
  };
}
// function addImagesToGallery(state: State<AppState>) {
//   return (images) => {
//     state.selectedGalleryImages.set((prev) => [...prev, ...images]);
//   };
// }
// function getImagesForGallery(state: State<AppState>) {
//   return () => {
//     return state.selectedGalleryImages.get();
//   };
// }

function getLocationScreensAndSettings(state: State<AppState>) {
  return () => {
    return state.locationScreenAndSettings.get();
  };
}
function getDefaultLocation(state: State<AppState>) {
  return () => {
    return state.defaultLocation.get();
  };
}
function getClientDetail(state: State<AppState>) {
  return () => {
    return state.clientDetail.get();
  };
}

function getSelectedLocationScrenAndSettings(state: State<AppState>) {
  return () => {
    return state.selectedLocationScreenAndSettings.get();
  };
}

// function getImages(state: State<AppState>) {
//   return () => state.uploadedImages.get();
// }

// created by Razi

function getOrgImages(state: State<AppState>) {
  return () => {
    return state.uploadOrgImages.get();
  };
}

// function updateImage(state: State<AppState>) {
//   return (original: UploadedPhoto, updated: UploadedPhoto) => {
//     state.uploadedImages.set((previous) => {
//       return previous.map((photo) => {
//         if (photo.id === original.id) {
//           return updated;
//         }
//         return photo;
//       });
//     });
//   };
// }

function setSelectAll(state: State<AppState>) {
  return (value: boolean) => {
    state.selectAll.set(value);
  };
}
function setCalibrationCheck(state: State<AppState>) {
  return (value: boolean) => {
    state.calibrationCheck.set(value);
  };
}

function getCalibrationCheck(state: State<AppState>) {
  return () => {
    return state.calibrationCheck.get();
  };
}
function getRefectchRoomCalibration(state: State<AppState>) {
  return () => {
    return state.roomCalibrationCheck.get();
  };
}

function setPaymentCheck(state: State<AppState>) {
  return (value: boolean) => {
    state.paymentCheck.set(value);
  };
}
function setRefectchRoomCalibration(state: State<AppState>) {
  return (value: boolean) => {
    state.roomCalibrationCheck.set(value);
  };
}

function getPaymentCheck(state: State<AppState>) {
  return () => {
    return state.paymentCheck.get();
  };
}
function setCustomPaymentCheck(state: State<AppState>) {
  return (value: boolean) => {
    state.customPaymentcheck.set(value);
  };
}

function getCustomPaymentCheck(state: State<AppState>) {
  return () => {
    return state.customPaymentcheck.get();
  };
}
function getSelectAll(state: State<AppState>) {
  return () => {
    return state.selectAll.get();
  };
}

// function getSelectedImages(state: State<AppState>) {
//   return () => {
//     return state.selectedImages.get();
//   };
// }

// function setSelectedImages(state: State<AppState>) {
//   return (photos: UploadedPhoto[]) => {
//     return state.selectedImages.set(photos);
//   };
// }
// FUNCTION TO update selected images if one is removed from uploaded photos //
// function removeSelectedImage(state: State<AppState>) {
//   return (image: UploadedPhoto) => {
//     state.selectedImages.set((previous) => {
//       return previous.filter((photo) => photo.id !== image.id);
//     });
//   };
// }

function selectPhoto(state: State<AppState>) {
  return (photo: UploadedPhoto) => {
    state.selectedImages.set((selectedImages) => {
      const alreadyAdded = selectedImages.find((item) => item.id === photo.id);
      //case 1: add if it hasn't been selected
      if (!alreadyAdded) {
        return [...selectedImages, photo];
      }
      // case 2: remove it if it's already been selected
      else {
        return selectedImages.filter((item) => item.id !== photo.id);
      }
    });
  };
}

function addProduct(state: State<AppState>) {
  return (
    photo: UploadedPhoto,
    height: number,
    width: number,
    frame: {
      value: string;
      id: string;
      price: string;
      img: string;
      frameWidth?: string,
    },
    matting: {
      value: string;
      id: string;
      price: string;
      colorCode: string;
    },
    size: {
      value: string;
      id: string;
      price: string;
    },
    heightSize: number,
    widthSize: number,
    productOptionsPrices: {},
    productDetails: {
      title: string;
      description: string;
      id: string;
      flatCost: string;
      flatPrice: string;
    },
    note?: string,

    todoList?: any
  ) => {
    return state.products.set((previous) => {
      const product: Product = {
        id: uuidv4(),
        photo: photo,
        productDetails: productDetails,
        calibratedDimensions: {
          height: height,
          width: width,
        },
        frame: frame,
        matting: matting,
        size: size,
        sizeDetails: {
          height: heightSize,
          width: widthSize,
          sizeName: `${widthSize}x${heightSize}`,
        },
        productOptionsPrices: productOptionsPrices,
        note: note,
        todoList: todoList,
      };
      return [...previous, product];
    });
  };
}
function addProductToRoomView(state: State<AppState>) {
  return (
    id: string,
    frameImage: string,
    imageUrl: string,
    matting: string,
    heightSize: number,
    widthSize: number,
    x_point?: number,
    y_point?: number
  ) => {
    return state.roomViewProducts.set((previous) => {
      const roomViewProducts: RoomViewProducts = {
        id: id,
        frameImage: frameImage,
        imageUrl: imageUrl,
        matting: matting,

        sizeDetails: {
          height: heightSize,
          width: widthSize,
        },
        anchorPoints: {
          x: x_point,
          y: y_point,
        },
      };
      return [...previous, roomViewProducts];
    });
  };
}

//NEW ADDITION FOR PRODUCT SELECTION AND ROOM VIEW REFACTOR
function addImageToRoomView(state: State<AppState>) {
  return (
    id: string,
    base64: string,
    path: string,
    resizedBase64: string,
    thumbnailBase64: string,
    frameImage: string,
    matting: string,
    // widthSize: number,
    x_point?: number,
    y_point?: number,
    height?: number,
    width?: number,
  ) => {
    return state.roomViewImages.set((previous) => {
      const roomViewImages: RoomViewImages = {
        id: id,
        base64: base64,
        path: path,
        resizedBase64: resizedBase64,
        thumbnailBase64: thumbnailBase64,
        frameImage: frameImage,
        matting: matting,
        anchorPoints: {
          x: x_point,
          y: y_point,
        },
        height: height,
        width: width,
      };
      return [...previous, roomViewImages];
    });
  };
}
function addCustomRoomViewDetails(state: State<AppState>) {
  return (
    imageUrl: string,
    file: {},
    name: string,
    ppi: number,
    x_point?: number,
    y_point?: number,
  ) => {
    return state.customRoomDetails.set((previous) => {
      const customeRoomDetails: CustomRoomDetails = {
        id: uuidv4(),
        imageUrl: imageUrl,
        file: file,
        name: name,
        ppi: ppi,
        anchorPoints: {
          x: x_point,
          y: y_point,
        },
      };
      return [...previous, customeRoomDetails];
    });
  };
}

export function selectedCustomRoomDetails(state: State<AppState>) {
  return (image) => {
    return state.selectedCustomRoomDetails.set(image);
  };
}

export function setToolCustomRooms(state: State<AppState>) {
  return (images) => {
    state.toolCustomRooms.set((previous) => [...previous, ...images]);
  };
}
export function getToolCustomRooms(state: State<AppState>) {
  return () => state.toolCustomRooms.get();
}
function removeProduct(state: State<AppState>) {
  return (product: Product) => {
    state.products.set((previous) => {
      return previous.filter((current) => current.id !== product.id);
    });
  };
}
function removeRoomViewProduct(state: State<AppState>) {
  return (productId) => {
    state.roomViewProducts.set((previous) => {
      return previous.filter((current) => current.id !== productId);
    });
  };
}
function removeCustomRoomViewDetails(state: State<AppState>) {
  return (customRoomId) => {
    state.customRoomDetails.set((previous) => {
      return previous.filter((current) => current.id !== customRoomId);
    });
  };
}
//NEW ADDITION FOR PRODUCT SELECTION AND ROOM VIEW REFACTOR
function removeRoomViewImage(state: State<AppState>) {
  return (productId) => {
    state.roomViewImages.set((previous) => {
      return previous.filter((current) => current.id !== productId);
    });
  };
}

function removeAllProducts(state: State<AppState>) {
  return () => {
    state.products.set([]);
  };
}

function getAllProducts(state: State<AppState>) {
  return () => {
    return state.products.get();
  };
}
function getRoomViewProducts(state: State<AppState>) {
  return () => {
    return state.roomViewProducts.get();
  };
}
//NEW ADDITION FOR PRODUCT SELECTION AND ROOM VIEW REFACTOR
function getRoomViewImages(state: State<AppState>) {
  return () => {
    return state.roomViewImages.get();
  };
}
function getCustomRoomViewDetails(state: State<AppState>) {
  return () => {
    return state.customRoomDetails.get();
  };
}
function getSelectedCustomRoomDetails(state: State<AppState>) {
  return () => {
    return state.selectedCustomRoomDetails.get();
  };
}

//set and get functions for notifications local state
function getNotifications(state: State<AppState>) {
  return () => {
    return state.notifications.get();
  };
}

function setNotifications(state: State<AppState>) {
  return (value) => {
    state.notifications.set(value);
  };
}

// export { UploadedPhoto };

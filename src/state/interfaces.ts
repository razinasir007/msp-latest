import { ProductSelectionState } from "./productSelectionState";
import { RoomViewState } from "./roomViewState";
import {
  screenCalibrations,
  bordersAndBackgrounds,
  slideShow,
} from "./interfaces/screenPojectorInterface";

export interface AppState {
  user?: UserProfile;
  uploadedImages: UploadedPhoto[];
  clientImages: UploadedPhoto[];
  originalImages: UploadedPhoto[];
  presentationImages: UploadedPhoto[];
  resizedImages: ResizedCache[];
  reminderDuration: ReminderDuration;
  stripePriceId: string;
  //created by razi
  uploadOrgImages: UploadedPhoto[];
  selectedImages: UploadedPhoto[];
  locationScreenAndSettings: LocationScreenAndSettings[];
  selectedLocationScreenAndSettings: LocationScreenAndSettings[];
  defaultLocation: DefaultLocation[];
  editedImages: UploadedPhoto[];
  // selectedGalleryImages: GalleryImages[];
  watermark: string;
  roomCalibrationCheck: boolean;
  products: Product[];
  roomViewProducts: RoomViewProducts[];
  customRoomDetails: CustomRoomDetails[];
  toolCustomRooms: CustomRoomDetails[];
  selectedCustomRoomDetails: CustomRoomDetails[];
  //NEW ADDITION FOR PRODUCT SELECTION AND ROOM VIEW REFACTOR
  roomViewImages: RoomViewImages[];
  selectAll: boolean;
  clientDetail: ClientDetail[];
  productSelection: ProductSelectionState;
  roomState: RoomViewState;
  calibrationCheck: Boolean;
  paymentCheck: Boolean;
  customPaymentcheck: Boolean;
  uploadedAudios: UploadedBase64[];
  screenCalibrations: screenCalibrations;
  bordersAndBackgrounds: bordersAndBackgrounds;
  slideShow: slideShow;
  notifications: Notification[];
}
export interface UploadedBase64 {
  id: string;
  isSelected?: boolean;
  filename: string;
  thumbnail?: string;
  base64: string;
  size: number;
  type: string;
  imageFile: {};
}
export interface UserProfile {
  uid?: string;
  email?: string;
  isOnboarded?: boolean;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  address?: string;
  firstname?: string;
  isActive?: boolean;
  storeLocId?: string;
  favoriteScreenSetting?: string;
  lastname?: string;
  grantLevel?: {
    grantLvl?: string;
    name?: string;
    description?: string;
  };
  role?: {
    id?: string;
    name?: string;
    description?: string;
    permissions?: any;
  };
  organization?: {
    id?: string;
    name?: string;
    address?: string;
    email?: string;
    website?: string;
    phoneNumber?: string;
    discountCheck?: boolean;
    discountCodeCheck?: boolean;
    dueDatePolicy?: number;
    logo?: {
      name?: string;
    };
    subscription?: {
      id?: string;
    };
  };
}
export interface ReminderDuration {
  value: string; // This should be a string representing the duration value
  label: string; // This is the label associated with the duration
}

export interface GalleryImages {
  content: string;
  id: string;
  name: string;
  size: string;
  stage: string;
  type: string;
  virtualPath: string;
}

export interface ClientDetail {
  email: string;
  fullname: string;
  id: string;
  phoneNumber: string;
}
export interface ResizedCache {
  id: string;
  name: string;
  base64: string;
}

export interface SelectedPhoto extends UploadedPhoto {
  selected: boolean;
}

export interface UploadedPhoto {
  id: string;
  thumbnailBase64: string;
  resizedBase64: string;
  base64: any;
  name?: string;
  filename?: string;
  size?: number;
  type?: string;
  file?: {
    name: string;
    size: string;
    type: string;
    path: string;
  };
  rating?: number;
  path: string;
  uploaded?: boolean;
}
export interface RoomViewProducts {
  id: string;
  frameImage: string;
  imageUrl: string;
  matting: string;

  sizeDetails: {
    height: number;
    width: number;
  };
  anchorPoints: {
    x: number | undefined;
    y: number | undefined;
  };
}
export interface CustomRoomDetails {
  id: string;
  imageUrl: string;
  resizedBase64?: string;
  imageId?: string;
  frameImage?: string;
  matting?: string;
  file: {},
  name: string;
  ppi: number | string;
  anchorPoints: {
    x: number | undefined;
    y: number | undefined;
  };
}
//NEW ADDITION FOR PRODUCT SELECTION AND ROOM VIEW REFACTOR
export interface RoomViewImages {
  id: string;
  thumbnailBase64: string;
  resizedBase64: string;
  base64: any;
  path: string;
  frameImage?: string;
  matting?: string;
  anchorPoints: {
    x: number | undefined;
    y: number | undefined;
  };
  height: number | undefined
  width: number | undefined
}
export interface Product {
  id: string;
  productDetails: {
    title: string;
    description: string;
    id: string;
    flatCost: string;
    flatPrice: string;
  };
  photo: UploadedPhoto;
  calibratedDimensions: {
    height: number;
    width: number;
  };
  frame: {
    value: string;
    id: string;
    price: string;
    cost: string;
    img: string;
    frameWidth?: string;
  };
  matting: {
    value: string;
    id: string;
    price: string;
    cost: string;
    colorCode: string;
  };
  size: {
    value: string;
    id: string;
    cost: string;
    price: string;
  };
  sizeDetails: {
    height: number;
    width: number;
    sizeName: string;
  };
  productOptionsPrices: {
    frame?: number;
    matting?: number;
    size?: number;
  };
  note?: string;
  // rating?: number;
  todoList?: any;
}

export interface Order {
  name: string;
  id: string;
  stage: string;
  items: string;
  price: string;
  dueDate?: string;
  createdAt: string;
}

export interface LocationScreenAndSettings {
  id: string;
  locationId: string;
  name: string;
  ppi: number;
}

export interface DefaultLocation {
  address: string;
  id: string;
  name: string;
}

export interface InvoiceDetails {
  orderSubtotalAmount: any;
  balanceDue: string;
  id: string;
  createdAt: string;
  currency: string;
  discountAbsoluteAmount: string;
  discountAmountPercentage: string;
  orderAmount: string;
  orderId: string;
  paidAmount: string;
  salesTaxAmount: string;
  shippingAmount: string;
  status: string;
  totalAmount: string;
}

export interface Notification {
  isRead: boolean;
  notification: {
    id: string;
    timestamp: string;
    type: string;
    content: string;
    createdBy: string;
  };
}

export interface TodoList {
  name: string;
  isCompleted: boolean;
  id: string;
  sortingIndex: number;
}


export interface RoomDetails {

  id: string
  imageUrl: string
  ppi: number
  anchorPoints: {
    x: string;
    y: string;
  },

}
export interface calibrationStateType {
  ppi: number;
  anchorPoints: {
    x: number,
    y: number
  }
}
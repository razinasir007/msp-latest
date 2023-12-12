import { State } from "@hookstate/core";

export interface OrgDetails {
  orgID?: string;
  orgName?: string;
  orgEmail?: string;
  phoneNumber?: string | number;
  orgAddress?: string;
  orgWebsite?: string;
  dueDatePolicy?: number;
  discountCheck?: boolean;
  discountCodeCheck?: boolean;
  locations?: Array<Location>;
  logo?: {
    name?: string;
  };
  location?: {
    label?: string;
    value?: {
      description?: string;
    };
  };

  parsedLocation?: Location;
}

export interface Location {
  countryName?: string;
  administrativeArea?: string;
  administrativeAreaLevel2?: string;
  placeName?: string;
  sublocality?: string;
  thoroughfareName?: string;
  thoroughfareNumber?: string;
  subUnitDesignator?: string;
  subUnitIdentifier?: string;
  postalCode?: string;
  isPrimary?: boolean;
}

export interface LocationDetails extends Location {
  email?: string;
  phoneNumber?: string | number;
  isDisabled?: boolean;
  address?: string;
  location?: {
    label?: string;
    value?: {
      description?: string;
    };
  };
  salesTax?: string | number;
  parsedLocation?: Location;
  id?: string;
  isPrimary?: boolean;
  name?: string;
}

export interface SignupDetails {
  fullName?: string;
  email?: string;
  password?: string;
}

export interface LoginDetails {
  email?: string;
  password?: string;
}

export interface UserDetails {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  grantLevel?: {
    grantLvl?: number;
    name?: string;
  };
  role?: {
    id?: number;
    name?: string;
  };
  location: {
    id?: string;
    label?: string;
    value?: {
      description?: string;
    };
  };
  organization?: {
    address?: string;
  };
  parsedLocation?: Location;
}

export interface ClientDetails {
  orgId?: string;
  locId?: string;
  id?: string;
  fullname?: string;
  email?: string;
  createdAt?: string;
  lastname?: string;
  phoneNumber?: string;
  firstname?: string;
  zone?: string;
  country?: string;
  billingAddress?: string;
  mailAddress?: string;
  lastContactedAt?: string;
  appointments?: {};
  parsedLocation?: Location;
}
export interface CreateOrgDetails {
  id?: string;
  name?: string;
  address?: string;
  email?: string;
  logoExtension?: string;
  phoneNumber?: string;
  logo?: {
    name?: string;
  };
  website?: string;
  salesTax?: string | number;
  parsedLocation?: Location;
}
export interface OrgUsers {
  id?: string;
  fullname?: string;
  email?: string;
  status?: {
    value?: boolean;
    label?: string;
  };
  role?: {
    value?: boolean;
    label?: string;
  };
  store?: string;
}

export interface ProductDetails {
  id?: string;
  title?: string;
  description?: string;
  reservedOptions?: State<ProductOptions[], {}>;
  regularOptions?: State<ProductOptions[], {}>;
  options?: State<ProductOptions[]>;
  status?: {
    value?: boolean;
    label?: string;
  };
  variants?: number;
  flatPrice?: number;
  flatCost?: number;
}

export interface ProductOptions {
  id?: string;
  name?: string;
  sortingIndex?: number;
  regularFields?: [];
  reservedFields?: [];
  fields?: [
    {
      id?: string;
      sortingIndex?: number;
      value?: string;
      price?: number;
      cost?: number;
    }
  ];
}

export interface AddRecipientDetails {
  id?: string;
  orgId?: string;
  storeLocId?: string;
  email?: string;
  grantLvl?: string | number;
  roleId?: string | number;
}

export interface AddNotes {
  id?: string;
  text?: string;
  date?: string;
}

export interface GetOrdersData {
  id?: string;
  numberOfProducts?: string;
  createdAt?: string;
  stage?: string;
}
export interface Image {
  resizedContent: any;
  content: string;
  isFavourite: string;
  virtualPath: string;
  id: string;
  name: string;
  size: number;
  stage: string;
  type: string;
}
export interface Folder {
  images: Image[];
  folderName1: {
    images: Image[];
  };
  folderName2: {
    images: Image[];
  };
}

export interface EditableField {
  id?: string;
  name?: string;
  inputType?: {
    value?: string;
    label?: string;
  };
  required?: boolean;
  sortingIndex?: number;
  orgId?: string;
}
export interface EditableTags {
  id?: string;
  name?: string;
  description?: string;
  sortingIndex?: number;
  orgId?: string;
  createdAt?: string;
}

export interface OrderDetails {
  resizedContent: any;
  isFavourite: boolean;
  content: string;
  name: string;
  id: string;
  orders: {
    lookup: {
      products: [
        {
          photo: {
            isFavourite: boolean;
            content: string;
            id: string;
            name: string;
            size: number;
            stage: string;
            type: string;
            virtualPath: string;
          };
        }
      ];
    };
  };
}
export interface PhotoDetails {
  isFavourite: boolean;
  content: string;
  id: string;
  name: string;
  size: number;
  stage: string;
  type: string;
  virtualPath: string;
}

export interface EmployeeDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  parsedLocation?: Location;
}

export interface TermsAndConditions {
  id: string;
  title: string;
  type: string;
  description: string;
  orgId: string;
  isRequired: boolean;
}

export interface SubscriptionPlans {
  id: string;
  title: string;
  description: string;
  amount: number;
  benefits: [];
  currency: string;
  intervalCount: number;
  intervalUnit: string;
  cycleAmount: string;
}

export interface AppointmentDetails {
  title: string;
  description: string;
  orgId?: string;
  startTime: string;
  endTime: string;
  clientId?: string;
  userId?: string;
  isInternal?: boolean;
  parsedLocation?: string;
}

export interface ProductReservedOption {
  name: string;
  reservedFields: ReservedField[];
  sortingIndex: number;
  __typename: string;
}
export interface ProductRegularOption {
  name: string;
  reservedFields: RegularFiled[];
  sortingIndex: number;
  __typename: string;
}

export interface ReservedField {
  id: string;
  sortingIndex: number;
  value: string;
}
export interface RegularFiled {
  id: string;
  sortingIndex: number;
  value: string;
}
export interface ProductOptionsDetails {
  description: string;
  flatCost: null | number;
  flatPrice: null | number;
  id: string;
  reservedOptions: ProductReservedOption[];
  regularOptions: ProductRegularOption[];
  status: {
    value: boolean;
    label: string;
  };
  title: string;
  variants: number;
}

export interface PaymentDetails {
  item: string;
  status?: string;
  paymentDate: string;
  amountPaid: string;
  amountRemaining: string;
  type?: string;
}

export interface DiscountCodeField {
  id: string;
  discountValueType: string;
  discountCodeText: string;
  discountValue: number;
}

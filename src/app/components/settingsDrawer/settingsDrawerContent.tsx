import { IconType } from "react-icons";
import { MdManageAccounts } from "react-icons/md";
import { CgOrganisation } from "react-icons/cg";
import { FaUsers, FaBell } from "react-icons/fa";
import { AiFillSmile, AiFillLock, AiFillTag, AiFillApi } from "react-icons/ai";
import { PiPackageFill } from "react-icons/pi";
import { IoImages } from "react-icons/io5";
import { TiCreditCard } from "react-icons/ti";
import { RiProjector2Fill } from "react-icons/ri";
import { IoDocumentsSharp } from "react-icons/io5";
import { HiInformationCircle } from "react-icons/hi2";
import { LuWebhook } from "react-icons/lu";
import { getPermissionsDictionary } from "../../routes/permissionsProvider";

interface LinkItemProps {
  name: string;
  path: string;
  icon: IconType;
  permissionLevel: number;
  permissions: any;
}
const permissionsDictionary = getPermissionsDictionary();
export const LinkItems: Array<LinkItemProps> = [
  {
    name: "Account",
    path: "/mystudio/settings/account",
    icon: MdManageAccounts,
    permissionLevel: 20,
    permissions: permissionsDictionary?.settings_account,
  },
  {
    name: "Org. Management",
    path: "/mystudio/settings/organization",
    icon: CgOrganisation,
    permissionLevel: 40,
    permissions: permissionsDictionary?.settings_org_management,
  },
  {
    name: "User Management",
    path: "/mystudio/settings/user",
    icon: FaUsers,
    permissionLevel: 40,
    permissions: permissionsDictionary?.settings_user_management,
  },
  {
    name: "Customer Management",
    path: "/mystudio/settings/customer",
    icon: AiFillSmile,
    permissionLevel: 40,
    permissions: permissionsDictionary?.settings_customer_management,
  },
  // {
  //   name: "Notifications",
  //   path: "/mystudio/settings/notifications",
  //   icon: FaBell,
  //   permissionLevel: 20,
  // },
  {
    name: "Payments",
    path: "/mystudio/settings/payments",
    icon: TiCreditCard,
    permissionLevel: 40,
    permissions: permissionsDictionary?.settings_org_management,
  },
  {
    name: "Privacy",
    path: "/mystudio/settings/privacy",
    icon: AiFillLock,
    permissionLevel: 20,
    permissions: permissionsDictionary?.settings_account,
  },
  {
    name: "Screen/Projector",
    path: "/mystudio/settings/projector",
    icon: RiProjector2Fill,
    permissionLevel: 20,
    permissions: permissionsDictionary?.settings_screen_projector,
  },
  {
    name: "Products",
    path: "/mystudio/settings/products",
    icon: AiFillTag,
    permissionLevel: 40,
    permissions: permissionsDictionary?.settings_products,
  },
  {
    name: "Package Management",
    path: "/mystudio/settings/packages",
    icon: PiPackageFill,
    permissionLevel: 40,
    permissions: permissionsDictionary?.settings_org_management,
  },
  {
    name: "Documents",
    path: "/mystudio/settings/documents",
    icon: IoDocumentsSharp,
    permissionLevel: 20,
    permissions: permissionsDictionary?.settings_org_management,
  },
  {
    name: "Terms & Conditions",
    path: "/mystudio/settings/termsConditions",
    icon: HiInformationCircle,
    permissionLevel: 20,
    permissions: permissionsDictionary?.settings_terms_and_conditions,
  },
  {
    name: "Integrated APIs",
    path: "/mystudio/settings/apis",
    icon: AiFillApi,
    permissionLevel: 40,
    permissions: permissionsDictionary?.settings_org_management,
  },
  {
    name: "Room View",
    path: "/mystudio/settings/roomview",
    icon: IoImages,
    permissionLevel: 40,
    permissions: permissionsDictionary?.settings_org_management,
  },
  {
    name: "Webhooks",
    path: "/mystudio/settings/webhooks",
    icon: LuWebhook,
    permissionLevel: 40,
    permissions: permissionsDictionary?.settings_org_management,
  },
];

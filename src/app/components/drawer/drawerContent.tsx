import { IconType } from "react-icons";
import { FaMoneyCheckAlt, FaFileInvoice, FaBell } from "react-icons/fa";
import { BiHome } from "react-icons/bi";
import { MdChromeReaderMode } from "react-icons/md";
import { AiFillCalendar, AiFillTool } from "react-icons/ai";
import { HiUsers } from "react-icons/hi";
import { IoSettingsSharp } from "react-icons/io5";
// import { ROLES } from "../../../constants";
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
    name: "Dashboard",
    path: "/mystudio/dashboard",
    icon: BiHome,
    permissionLevel: 20,
    permissions: permissionsDictionary?.dashboard,
  },
  {
    name: "Contacts",
    path: "/mystudio/contacts",
    icon: HiUsers,
    permissionLevel: 20,
    permissions: permissionsDictionary?.contacts,
  },
  // { name: "Tool", path: "/mystudio/tool", icon: AiFillTool,permissionLevel: 20, },
  {
    name: "Calendar",
    path: "/mystudio/calendar",
    icon: AiFillCalendar,
    permissionLevel: 20,
    permissions: permissionsDictionary?.calendar,
  },
  {
    name: "Sales/Orders",
    path: "/mystudio/sales",
    icon: FaMoneyCheckAlt,
    permissionLevel: 40,
    permissions: permissionsDictionary?.sales,
  },
  {
    name: "Production",
    path: "/mystudio/production",
    icon: MdChromeReaderMode,
    permissionLevel: 30,
    permissions: permissionsDictionary?.production,
  },
  // { name: "Invoices", path: "/mystudio/invoices", icon: FaFileInvoice,permissionLevel: 20, },

  {
    name: "Notifications",
    path: "/mystudio/notifications",
    icon: FaBell,
    permissionLevel: 20,
    permissions: permissionsDictionary?.notifications,
  },
  {
    name: "Settings",
    path: "/mystudio/settings/account",
    icon: IoSettingsSharp,
    permissionLevel: 20,
    permissions: permissionsDictionary?.settings_account,
  },
];

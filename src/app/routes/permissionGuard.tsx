import React, { createContext } from "react";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../state/store";

export const UserPermissions = createContext({ userPermissions: {} });
export default function PermissionGuard({ roles, permissions, children }) {
  const userState = useHookstate(globalState.user);
  const stateUser = userState.get();
  let userPermissions = {
    fullAccess: false,
    view: false,
    create: false,
    edit: false,
    delete: false,
  };
  if (stateUser?.uid) {
    const rolePermissions = stateUser?.role?.permissions.map((permission) => {
      return permission;
    });
    if (permissions && stateUser) {
      const allAccess = rolePermissions.includes(permissions["*"]);
      const create = rolePermissions.includes(permissions.create);
      const view = rolePermissions.includes(permissions.view);
      const edit = rolePermissions.includes(permissions.edit);
      const del = rolePermissions.includes(permissions.delete);
      userPermissions = {
        fullAccess: allAccess,
        view: view,
        create: create,
        edit: edit,
        delete: del,
      };
    }
  }
  return (
    <>
      {stateUser?.uid ? (
        <UserPermissions.Provider value={{ userPermissions }}>
          {userPermissions.fullAccess ||
          userPermissions.view ||
          userPermissions.create ||
          userPermissions.edit ||
          userPermissions.delete
            ? children
            : null}
        </UserPermissions.Provider>
      ) : null}
    </>
  );
}

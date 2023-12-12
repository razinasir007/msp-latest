import { useQuery } from "@apollo/client";
import { Center, Spinner, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { GetPermissions } from "../../apollo/permissionsQueries";
import AppRouter from "../AppRouter1";

let permissionsDictionary;

export function getPermissionsDictionary() {
  return permissionsDictionary;
}

function setPermissionsDictionary(permissions) {
  permissionsDictionary = permissions;
}

export default function PermissionsProvider() {
  const [permissions, setPermissions] = useState();
  const {
    loading: permissionsLoading,
    error: permissionsError,
    data: permissionsData,
  } = useQuery(GetPermissions, {
    onCompleted: (data) => {
      setPermissionsDictionary(
        data?.dynamicRolesPermissions?.getPermissionMapping
      );
      setPermissions(data?.dynamicRolesPermissions?.getPermissionMapping);
    },
  });

  return (
    <>
      {permissionsLoading && !permissions ? (
        <Center h='100vh' w='100%'>
          <Spinner />
        </Center>
      ) : (
        <RouterProvider router={AppRouter()} />
      )}
    </>
  );
}

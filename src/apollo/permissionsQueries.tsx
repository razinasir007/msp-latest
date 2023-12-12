import { gql } from "@apollo/client";

export const GetGrantLevels = gql(`query getGrantLevels {
  grantLevels {
    get {
      description
      grantLvl
      name
    }
  }
}
`);

export const AssignGrantLevel = gql(`mutation assignGrantLevel(
    $createdBy: String!
    $userPermission: UserPermissionInput!
  ) {
    userPermissions {
      create(
        createdBy: $createdBy
        userPermission: $userPermission
      )
    }
  }
`);

export const UpdateGrantLevel = gql(`mutation updateGrantLevel(
    $updatedBy: String!
    $userPermission: UserPermissionInput!
  ) {
    userPermissions {
      update(
        updatedBy: $updatedBy
        userPermission: $userPermission
      )
    }
  }
`);

export const CreateDefaultRoles=gql(`
mutation CreateDefaultRoles($createdBy: String!, $orgId: String!) {
  dynamicRolesPermissions {
    createDefaultRolesAndPermissions(createdBy: $createdBy, orgId: $orgId)
  }
}
`)

export const AssignUserRole = gql(`
mutation AssignUserRole($roleId: String!, $setBy: String!, $userId: String!) {
  dynamicRolesPermissions {
    assignUserRole(roleId: $roleId, setBy: $setBy, userId: $userId)
  }
}
`)

export const CreateRole = gql(`
mutation CreateRole($createdBy: String!, $id: String!, $name: String!, $orgId: String!, $permissions: [String!]!, $description: String!) {
  dynamicRolesPermissions {
    createRolePermissions(
      createdBy: $createdBy
      role: {id: $id, name: $name, orgId: $orgId, permissions: $permissions, description: $description}
    )
  }
}
`)

export const UpdateRole = gql(`
mutation UpdateRole( $updatedBy: String!, $id: String!, $name: String!, $description: String!, $orgId: String!, $permissions: [String!]!) {
  dynamicRolesPermissions {
    updateRole(
      role: {id: $id, name: $name, orgId: $orgId, permissions: $permissions, description: $description}
      updatedBy: $updatedBy
    )
  }
}
`)

export const DeleteRole = gql(`
mutation DeleteRole($id: String!) {
  dynamicRolesPermissions {
    deleteRole(id: $id)
  }
}
`)

export const GetRolesByOrgId = gql(`
query GetRolesByOrgId($orgId: String!) {
  dynamicRolesPermissions {
    lookupRolesByOrganization(orgId: $orgId) {
      name
      description
      id
    }
  }
}
`) 

export const GetRolePermissions = gql(`
query GetRolePermissions($id: String !) {
  dynamicRolesPermissions {
    lookupPermissionByRole(id: $id)
  }
}
`)

// export const GetAllPermissions =gql(`
// query GetAllPermissions {
//   dynamicRolesPermissions {
//     getPermissions {
//       id
//       value
//     }
//   }
// }
// `)

export const GetPermissions =gql(`
query GetPermissions {
  dynamicRolesPermissions {
    getPermissionMapping
  }
}
`)

export const GetPermissionsEnum =gql(`
query GetPermissionsEnum {
  dynamicRolesPermissions {
    getPermissionsEnum
  }
}
`)
import React from "react";
import { useQuery } from "@apollo/client";
import { GetAllUsers } from "./userQueries";
import { GetAllUsersQuery } from "./gql-types/graphql";
import BasicCard from "../app/components/basicCard";

export function TestGraphql() {
  const { loading, error, data } = useQuery<GetAllUsersQuery>(GetAllUsers);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data?.users.get.length !== 0 ? (
    <div className=''>
      {data?.users.get.map((user) => {
        return (
          <div key={user.id}>
            <BasicCard user={user} />
          </div>
        );
      })}
    </div>
  ) : (
    <div>
      <BasicCard data='No data to show' />
    </div>
  );
}

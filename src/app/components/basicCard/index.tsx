import React from "react";
import { Card, CardBody, Heading, Text } from "@chakra-ui/react";

export default function BasicCard(props) {
  return props.data ? (
    <Card bg={"gray.400"} variant={"elevated"} sx={{ maxWidth: 350, position: "relative" }}>
      <CardBody>
        <Heading as='h6'>{props.data}</Heading>
      </CardBody>
    </Card>
  ) : (
    <Card bg={"gray.400"} variant={"elevated"} sx={{ maxWidth: 350 }}>
      <CardBody>
        <Text sx={{ fontSize: 14 }} color='text.secondary'>
          User details:
        </Text>
        <Heading as='h6'>
          {props.user.firstname} {props.user.lastname}
        </Heading>
        <Text variant='body2'>
          <span>
            <b>ID:</b> {props.user.id}
          </span>
        </Text>
        <Text variant='body2'>
          <span>
            <b>Email:</b> {props.user.email}
          </span>
        </Text>
        <Text variant='body2'>
          <span>
            <b>Created at:</b> {new Date(props.user.createdAt).toISOString()}
          </span>
        </Text>
        <Text variant='body2'>
          <span>
            <b>Updated at:</b> {new Date(props.user.updatedAt).toISOString()}
          </span>
        </Text>
      </CardBody>
    </Card>
  );
}

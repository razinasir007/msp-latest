import { ApolloClient, DefaultOptions, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import { appConfig } from "../config";

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
  },
  query: {
    fetchPolicy: "no-cache",
  },
};

const uploadLink = createUploadLink({
  uri: appConfig.BACKEND_URL,
});

// Initialize Apollo Client
export const apolloClient = new ApolloClient({
  uri: appConfig.BACKEND_URL,
  link: uploadLink,
  cache: new InMemoryCache(),
  defaultOptions: defaultOptions,
});

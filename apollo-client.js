import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, from, split } from '@apollo/client';
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from "graphql-ws"

const gqlURL = process.env.API_SERVER ?? 'http://localhost:3000/graphql';

const httpLink = createHttpLink({
  uri: gqlURL
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'Authorization': `Bearer ${localStorage.getItem('gql_chat_access_token')}`
    }
  }));
  return forward(operation);
});

const wsLink = new GraphQLWsLink(createClient({

  url: gqlURL

}));

const splitLink = split(

  ({ query }) => {

    const definition = getMainDefinition(query);

    return (

      definition.kind === 'OperationDefinition' &&

      definition.operation === 'subscription'

    );

  },
  wsLink,
  httpLink,

);

const client = new ApolloClient({
  link: from([authLink,splitLink]),
  cache: new InMemoryCache(),
});

export default client;
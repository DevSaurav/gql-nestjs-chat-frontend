import { ApolloClient, InMemoryCache } from "@apollo/client";

const createApolloClient = () => {
    return new ApolloClient({
        uri: process.env.API_SERVER??'http://localhost:3000/graphql',
        cache: new InMemoryCache(),
    });
};

export default createApolloClient;
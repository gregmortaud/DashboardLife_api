import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import resolvers from './resolvers';

const typeDefs = `
scalar Date

type Movie {
  idMovie: Int!
  name: String!
  year: String
  link_download: String!
  link_img: String
  synopsis: String
  viewed: Int!
}

type Query {
  movie(idMovie: Int, name: String, year: String, link_download: String, link_img: String, synopsis: String, viewed: Int): [Movie]
}

schema {
  query: Query
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;

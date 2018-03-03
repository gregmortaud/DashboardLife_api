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

type General_stat {
  newMovies: Int!
  newTravels: Int!
  id: Int!
}

type Query {
  movie(idMovie: Int, name: String, year: String, link_download: String, link_img: String, synopsis: String, viewed: Int): [Movie]
  general_stat(newMovies: Int, newTravels: Int): [General_stat]
}

schema {
  query: Query
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;

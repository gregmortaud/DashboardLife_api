import express from 'express';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './data/schema';
import resolvers from './data/resolvers';

const config = require('./config');

const GRAPHQL_PORT = config.portServer;

const graphQLServer = express();

graphQLServer.use(cors());
graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
graphQLServer.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

graphQLServer.listen(GRAPHQL_PORT);

import express from 'express';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './data/schema';
import resolvers from './data/resolvers';
import managerCrawler from './data/managerCrawler';

const config = require('./config');

const GRAPHQL_PORT = config.portServer;

const graphQLServer = express();

graphQLServer.use(cors());
graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
graphQLServer.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// 3600000
// 10000
var isLoading = false;

function crawlerLoop() {
    setTimeout(() => {
      // console.log("inside loop");
      crawlerLoop();
      isLoading = true;
      managerCrawler(function (response) {
        isLoading = false;
        crawlerLoop();
        return ;
      });
    }, 50000);
}
crawlerLoop();

graphQLServer.get('/movieCrawler', function (req, res) {
  if (isLoading == false) {
    // managerCrawler(function(response) {
      res.send('Hello World');
    // });
  } else {
    res.send('Crawler already in use');
  }
});

graphQLServer.listen(GRAPHQL_PORT);

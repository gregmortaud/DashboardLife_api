import { Sequelize,
  Movie
  } from './connectors';

const resolvers = {
  Query: {
    movie(_, args) {
      return Movie.findAll({ where: args });
    }
  }
};

export default resolvers;

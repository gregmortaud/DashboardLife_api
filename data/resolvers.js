import { Sequelize,
  Movie,
  General_stat
  } from './connectors';

const resolvers = {
  Query: {
    movie(_, args) {
      return Movie.findAll({ where: args });
    },
    general_stat(_, args) {
      return General_stat.findAll({ where: args });
    }
  }
};

export default resolvers;

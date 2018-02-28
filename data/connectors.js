import Sequelize from 'sequelize';
import _ from 'lodash';

const config = require('../config');
const env = process.env.NODE_ENV || 'development';

var host = 'localhost';
var dbName = 'dashlife';
var username = 'root';
var password = 'root';
var port = '8889';

if (env == 'development') {
  console.log("Env development");
} else if (env == 'production') {
  console.log("Env production");
  host = config.host;
  dbName = config.name;
  username = config.username;
  port = config.port;
  password = config.password;
}

const db = new Sequelize(dbName, username, password, {
  host: host,
  dialect: 'mysql',
  user     : username,
  password : password,
  port: port,
  //logging: false
});

const MovieModel = db.define('movie', {
  idMovie: { type: Sequelize.INTEGER, primaryKey: true},
  name: { type: Sequelize.STRING },
  year: { type: Sequelize.STRING },
  link_download: { type: Sequelize.STRING },
  link_img: { type: Sequelize.STRING },
  synopsis: { type: Sequelize.STRING },
  viewed: { type: Sequelize.INTEGER },
}, {
  timestamps: false,
  freezeTableName: true,
});

const Movie = db.models.movie;

export { Sequelize,
  Movie
};

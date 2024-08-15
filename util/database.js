const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodejs_db', 'root', '1234', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;

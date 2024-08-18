// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('nodejs_db', 'root', '1234', {
//   dialect: 'mysql',
//   host: 'localhost'
// });

// module.exports = sequelize;

const mongodb = require('mongodb');
// const { col } = require('sequelize');
const MongoClient = mongodb.MongoClient;
 
const mongoConnect = (callback) => {
  MongoClient.connect('mongodb+srv://kimhanjin:75kYKRBxracYLrj6@cluster0.0bms1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(result => {
    console.log("connected");
    callback(result);
  }).catch(err =>{
    console.log(err);
  });
};

module.exports = mongoConnect;
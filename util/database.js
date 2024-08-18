// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('nodejs_db', 'root', '1234', {
//   dialect: 'mysql',
//   host: 'localhost'
// });

// module.exports = sequelize;

let _db; 

const mongodb = require('mongodb');
// const { col } = require('sequelize');
const MongoClient = mongodb.MongoClient;
 
const mongoConnect = (callback) => {
  MongoClient.connect('mongodb+srv://kimhanjin:75kYKRBxracYLrj6@cluster0.0bms1.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0')
  .then(client => {
    console.log("connected");
    _db = client.db();
    callback();
  }).catch(err =>{
    console.log(err);
    throw err;
  });
};

const  getDb = () => {
  if(_db){
    return _db;
  }
    throw 'NO DB';
}

module.exports = {
  mongoConnect,
  getDb
};
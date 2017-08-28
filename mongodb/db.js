
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// var DB_URL = 'mongodb://localhost:27017/manifestPermissions';
var DB_URL = 'mongodb://localhost:27017/test';


mongoose.connect(DB_URL);

mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open to ' + DB_URL);
});

mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
});

module.exports = mongoose;
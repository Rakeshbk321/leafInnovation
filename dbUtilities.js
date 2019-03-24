'use strict';

const mongoose = require('mongoose');

//mongoose.Promise =  new Promise();

module.exports = {

	connect : () => {
		let mongourl = null;
	    mongourl = 'mongodb://'+ process.env.USER_NAME + ':' + process.env.PASSWORD + '@' +  process.env.HOST + ':' + process.env.PORT + '/' + process.env.DATABASE +'?authSource=admin&authenticationMechanism=SCRAM-SHA-1';
	    return mongoose.connect(mongourl, { promiseLibrary: global.Promise , config: { autoIndex : true } });	
	},

	disConnect : () => {
		return mongoose.connection.close();
	}
};

mongoose.connection.on('connected', () => {  
    console.log("Mongoose default connection is open");
});

mongoose.connection.on('error', (err) => {
     console.log("Mongoose default connection has occured "+err+" error");
});

mongoose.connection.on('disconnected', () => {
     console.log("Mongoose default connection is disconnected");
});
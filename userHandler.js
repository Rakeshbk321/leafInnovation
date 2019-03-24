'use strict';

//basic db utilities
const dbUtil = require('./dbUtilities');

//model declartion
const User = require('./models/user.model');

//controller declaration
const UserContoller = require('./controllers/userController');



module.exports.user = (event, context, callback) => {
    let methodName = !event.method ? "POST" : event.method;    
    if(methodName === "POST") {
        module.exports.createUser(event, context, callback);
    } else if(methodName === "GET") {
        module.exports.readUser(event, context, callback);
    } else if(methodName === "PUT") {
        module.exports.updateUser(event, context, callback);
    } else if(methodName === "DELETE") {
        module.exports.deleteUser(event, context, callback);
    }
};


//order
module.exports.createUser = (event, context, callback) => {
	try {
        let body = !event.body ? event : event.body;
        if(!body) {
            context.callbackWaitsForEmptyEventLoop = false;
            throw "Please provide the required parameter to create product.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            body.isActive = true;
            body.created_at = new Date().toISOString();
            body.updated_at = new Date().toISOString();
            return UserContoller.create(User, body);
        }).then(saveRes => {
        	dbUtil.disConnect();
        	context.callbackWaitsForEmptyEventLoop = false;
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'User created Successfully.'
            });
        }).catch(error => {
        	dbUtil.disConnect();
            context.callbackWaitsForEmptyEventLoop = false;
            return callback(null, {
                statusCode : 500,
                status : "Failure",
                message : error
            });    
        });    
    } catch(error) {
        context.callbackWaitsForEmptyEventLoop = false;
        return callback(null, {
            statusCode : 500,
            status : "Failure",
            message : error
        });    
    }
};

module.exports.readUser = (event, context, callback) => {
	try {
		let header = !event.headers ? event : event.headers;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, false)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return User.find(pathParam);
        }).then(response => {
            dbUtil.disConnect();
           	context.callbackWaitsForEmptyEventLoop = false;
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'retrived user data Successfully.',
                data : response
            });
        }).catch(error => {
            dbUtil.disConnect();
           	context.callbackWaitsForEmptyEventLoop = false;
            return callback(null, {
                statusCode : 500,
                status : "Failure",
                message : error
            });    
        });    
    } catch(error) {
        dbUtil.disConnect();
        context.callbackWaitsForEmptyEventLoop = false;
        return callback(null, {
            statusCode : 500,
            status : "Failure",
            message : error
        });    
    }
};

module.exports.updateUser = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            throw "Please provide the userName in the request path to update the user data.";
        }
        if(!body) {
            context.callbackWaitsForEmptyEventLoop = false;
            return callback(null, {
                statusCode : 500,
                status : "Failure",
                message : "Please provide the required parameter to update user."
            });
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, false)
        }).then(valdationRes => {
        	pathParam.isActive = true;
            return User.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such userName exits in the user data , Please make sure passed userName is correct. to update from user data."
            }
            body.updated_at = new Date().toISOString();
            return User.update(pathParam, body);
        }).then(saveRes => {
        	dbUtil.disConnect();
            context.callbackWaitsForEmptyEventLoop = false;
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'User details updated Successfully as requested.'
            });
        }).catch(error => {
            dbUtil.disConnect();
            context.callbackWaitsForEmptyEventLoop = false;
            return callback(null, {
                statusCode : 500,
                status : "Failure",
                message : error
            });    
        });    
    } catch(error) {
        dbUtil.disConnect();
        context.callbackWaitsForEmptyEventLoop = false;
        return callback(null, {
            statusCode : 500,
            status : "Failure",
            message : error
        });    
    }
};

module.exports.deleteUser = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            throw "Please provide the userName in the request path to delete the user data.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
        	pathParam.isActive = true;
            return User.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such userName exits in the user data , Please make sure passed userName is correct to deleted from user data."
            }
            let updatedAt = new Date().toISOString()
            return User.update(pathParam, {isActive : false, updated_at : updatedAt});
        }).then(saveRes => {
            dbUtil.disConnect();
            context.callbackWaitsForEmptyEventLoop = false;
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'User details deleted Successfully as requested.'
            });
        }).catch(error => {
            dbUtil.disConnect();
            context.callbackWaitsForEmptyEventLoop = false;
            return callback(null, {
                statusCode : 500,
                status : "Failure",
                message : error
            });    
        });    
    } catch(error) {
    	context.callbackWaitsForEmptyEventLoop = false;
        return callback(null, {
            statusCode : 500,
            status : "Failure",
            message : error
        });    
    }
};
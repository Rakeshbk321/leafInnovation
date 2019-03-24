'use strict';

//basic db utilities
const dbUtil = require('./dbUtilities');

//model declartion
const DeliveryAgent = require('./models/deliveryAgent.model'),
	User = require('./models/user.model'),
	Region = require('./models/region.model');

//controller declaration
const DeliveryAgentContoller = require('./controllers/deliveryAgentController'),
	UserContoller = require('./controllers/userController'),
	RegionContoller = require('./controllers/regionController');;

module.exports.deliveryAgent = (event, context, callback) => {
    let methodName = !event.method ? "POST" : event.method;    
    if(methodName === "POST") {
        module.exports.createDeliveryAgent(event, context, callback);
    } else if(methodName === "GET") {
        module.exports.readDeliveryAgent(event, context, callback);
    } else if(methodName === "PUT") {
        module.exports.updateDeliveryAgent(event, context, callback);
    } else if(methodName === "DELETE") {
        module.exports.deleteDeliveryAgent(event, context, callback);
    }
};


//deliveryAgent
module.exports.createDeliveryAgent = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        if(!header.userName || !header.password) {
           throw "Please provide the required parameter in header to authenticate request.";
        }
        if(!body) {
            throw "Please provide the required parameter to create deliveryAgent.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
        	return RegionContoller.validateRequest(Region, body.regionName);
        }).then(response => {
        	body.isActive = true;
        	body.agentRegionId = response._id;
        	body.created_at = new Date().toISOString();
            body.updated_at = new Date().toISOString();
            let deliveryAgentObject = new DeliveryAgent(body);
            return deliveryAgentObject.save();
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'deliveryAgent created Successfully.'
            });
        }).catch(error => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
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

module.exports.readDeliveryAgent = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
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
            return DeliveryAgent.find(pathParam).populate('agentRegionId').lean();
        }).then(response => {
        	if(!response) {
        		throw "There is no such deliveryAgent exits in site data.";
        	}
        	context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'retrived deliveryAgent data Successfully.',
                data : response
            });
        }).catch(error => {
        	context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
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

module.exports.updateDeliveryAgent = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            context.callbackWaitsForEmptyEventLoop = false;
            throw "Please provide the sku in the request path to update the deliveryAgent data.";
        }
        if(!body) {
            throw "Please provide the required parameter to update deliveryAgent.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return DeliveryAgent.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such deliveryAgent name exits in the deliveryAgent data , Please make sure passed name is correct. to update from deliveryAgent data."
            }
            return DeliveryAgent.update(pathParam, body);
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'DeliveryAgent details updated Successfully as requested.'
            });
        }).catch(error => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
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

module.exports.deleteDeliveryAgent = (event, context, callback) => {
	try {
        let header = !event.headers ? event : event.headers;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            throw "Please provide the deliveryAgent name in the request path to delete the deliveryAgent data.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return DeliveryAgent.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such deliveryAgent name exits in the deliveryAgent data , Please make sure passed deliveryAgent name is correct to deleted from deliveryAgent data."
            }
            return DeliveryAgent.update(pathParam, {isActive : false});
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'deliveryAgent details deleted Successfully as requested.'
            });
        }).catch(error => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
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



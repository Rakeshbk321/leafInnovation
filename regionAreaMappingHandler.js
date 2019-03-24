'use strict';

//basic db utilities
const dbUtil = require('./dbUtilities');

//model declartion
const RegionAreaMapping = require('./models/regionAreaMapping.model'),
	User = require('./models/user.model'),
	Region = require('./models/region.model');

//controller declaration
const RegionAreaMappingContoller = require('./controllers/regionAreaMappingController'),
	UserContoller = require('./controllers/userController'),
	RegionContoller = require('./controllers/regionController');


module.exports.regionAreaMapping = (event, context, callback) => {
    let methodName = !event.method ? "POST" : event.method;    
    if(methodName === "POST") {
        module.exports.createRegionAreaMapping(event, context, callback);
    } else if(methodName === "GET") {
        module.exports.readRegionAreaMapping(event, context, callback);
    } else if(methodName === "PUT") {
        module.exports.updateRegionAreaMapping(event, context, callback);
    } else if(methodName === "DELETE") {
        module.exports.deleteRegionAreaMapping(event, context, callback);
    }
};

//regionAreaMapping
module.exports.createRegionAreaMapping = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(!body) {
            throw "Please provide the required parameter to create region area mapping.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
        	return RegionContoller.validateRequest(Region, body.regionName);
        }).then(response => {
        	body.regionId = response._id;
        	body.isActive = true;
            body.created_at = new Date().toISOString();
            body.updated_at = new Date().toISOString();
            let regionAreaMappingObject = new RegionAreaMapping(body);
            return regionAreaMappingObject.save();
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Region area mapping created Successfully.'
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

module.exports.readRegionAreaMapping = (event, context, callback) => {
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
            return RegionAreaMapping.find(pathParam).populate('regionId').lean();
        }).then(response => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'retrived region area mapping data Successfully.',
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

module.exports.updateRegionAreaMapping = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            throw "Please provide the sku in the request path to update the regionAreaMapping data.";
        }
        if(!body) {
            context.callbackWaitsForEmptyEventLoop = false;
            throw "Please provide the required parameter to regionAreaMapping product.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return RegionAreaMapping.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such regionArea exits in the regionAreaMapping data , Please make sure passed regionArea is correct. to update from regionAreaMapping data."
            }
            body.updated_at = new Date().toISOString();
            return RegionAreaMapping.update(pathParam, body);
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'RegionAreaMapping details updated Successfully as requested.'
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

module.exports.deleteRegionAreaMapping = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            throw "Please provide the sku in the request path to delete the product data.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
        	pathParam.isActive = true;
            return RegionAreaMapping.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such regionArea exits in the regionAreaMapping data , Please make sure passed regionArea is correct to delete from regionAreaMapping data."
            }
            return RegionAreaMapping.update(pathParam, {isActive : false, updated_at : new Date().toISOString()});
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'RegionAreaMapping details deleted Successfully as requested.'
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



'use strict';

//basic db utilities
const dbUtil = require('./dbUtilities');

//model declartion
const Region = require('./models/region.model'),
	RegionAreaMapping = require('./models/regionAreaMapping.model'),
	User = require('./models/user.model');

//controller declaration
const RegionContoller = require('./controllers/regionController'),
	UserContoller = require('./controllers/userController');

let ObjectId = require('mongodb').ObjectID;


module.exports.region = (event, context, callback) => {
    let methodName = !event.method ? "POST" : event.method;    
    if(methodName === "POST") {
        module.exports.createRegion(event, context, callback);
    } else if(methodName === "GET") {
        module.exports.readRegion(event, context, callback);
    } else if(methodName === "PUT") {
        module.exports.updateRegion(event, context, callback);
    } else if(methodName === "DELETE") {
        module.exports.deleteRegion(event, context, callback);
    }
};


//Region
module.exports.createRegion = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(!body) {
           throw "Please provide the required parameter to create region.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
        	body.isActive = true;
            body.created_at = new Date().toISOString();
            body.updated_at = new Date().toISOString();
            let regionObject = new Region(body);
            return regionObject.save();
        }).then(saveRes => {
        	dbUtil.disConnect();
            context.callbackWaitsForEmptyEventLoop = false;
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Region created Successfully.'
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

module.exports.readRegion = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        let regionData;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, false)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return Region.findOne(pathParam).lean();
        }).then(response => {
        	if(!response) {
        		throw "There is no such region exits in region data.";
        	}
        	regionData = response;
        	let regionId = response._id;
        	return RegionAreaMapping.find({ regionId : new ObjectId(regionId), isActive : true}).lean();
        }).then(regionMappingData => {
        	regionData.regionAreaMapping = !regionMappingData ? [] : regionMappingData;
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'retrived region data Successfully.',
                data : regionData
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

module.exports.updateRegion = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            throw "Please provide the region in the request path to update the regionData data.";
        }
        if(!body) {
            throw "Please provide the required parameter to update region.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return Region.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such region exits in the region data , Please make sure passed region is correct. to update from region data."
            }
            body.updated_at = new Date().toISOString();
            return Region.update(pathParam, body);
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'region details updated Successfully as requested.'
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

module.exports.deleteRegion = (event, context, callback) => {
 	try {
        let  header = !event.headers ? event : event.headers;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            throw "Please provide the sku in the request path to delete the region data.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            return Region.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such region exits in the region data , Please make sure passed region is correct to delete from region data."
            }
            return Region.update(pathParam, {isActive : false});
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Region details deleted Successfully as requested.'
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


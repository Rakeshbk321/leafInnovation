'use strict';

//basic db utilities
const dbUtil = require('./dbUtilities');

//model declartion
const Inventory = require('./models/inventory.model'),
	User = require('./models/user.model');

//controller declaration
const InventoryContoller = require('./controllers/inventoryController'),
	UserContoller = require('./controllers/userController');


module.exports.inventory = (event, context, callback) => {
    let methodName = !event.method ? "POST" : event.method;    
    if(methodName === "POST") {
        module.exports.createInventory(event, context, callback);
    } else if(methodName === "GET") {
        module.exports.readInventory(event, context, callback);
    } else if(methodName === "PUT") {
        module.exports.updateInventory(event, context, callback);
    } else if(methodName === "DELETE") {
        module.exports.deleteInventory(event, context, callback);
    }
};

//inventory
module.exports.createInventory = (event, context, callback) => {
  try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        if(!header.userName || !header.password) {
           throw "Please provide the required parameter in header to authenticate request.";
        }
        if(!body) {
            throw "Please provide the required parameter to create inventory for product.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
        	body.isActive = true;
        	body.created_at = new Date().toISOString();
            body.updated_at = new Date().toISOString();
            let inventoryObject = new Inventory(body);
            return inventoryObject.save();
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Inventory created Successfully.'
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

module.exports.readInventory = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, false)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return Inventory.find(pathParam).lean();
        }).then(response => {
        	if(!response) {
        		throw "There is no such inventory exits in site data.";
        	}
        	context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'retrived Inventory data Successfully.',
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

module.exports.updateInventory = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            context.callbackWaitsForEmptyEventLoop = false;
            throw "Please provide the sku in the request path to update the inventory data.";
        }
        if(!body) {
            throw "Please provide the required parameter to update inventory.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return Inventory.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such sku exits in the inventory data , Please make sure passed sku is correct. to update from inventory data."
            }
            body.updated_at = new Date().toISOString();
            return Inventory.update(pathParam, body);
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Inventory details updated Successfully as requested.'
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

module.exports.deleteInventory = (event, context, callback) => {
	try {
        let header = !event.headers ? event : event.headers;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            throw "Please provide the sku in the request path to delete the inventory data.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return Inventory.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such sku exits in the inventory data , Please make sure passed sku is correct to deleted from inventory data."
            }
            return Inventory.update(pathParam, {isActive : false, updated_at : new Date().toISOString()});
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Inventory details deleted Successfully as requested.'
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



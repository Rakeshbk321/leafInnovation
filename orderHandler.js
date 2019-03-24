'use strict';

//basic db utilities
const dbUtil = require('./dbUtilities');

//model declartion
const Order = require('./models/order.model'),
	User = require('./models/user.model'),
	RegionAreaMapping = require('./models/regionAreaMapping.model'),
	LastmileStatus = require('./models/lastmileStatus.model');

//controller declaration
const OrderContoller = require('./controllers/orderController'),
	UserContoller = require('./controllers/userController');


module.exports.order = (event, context, callback) => {
    let methodName = !event.method ? "POST" : event.method;    
    if(methodName === "POST") {
        module.exports.createOrder(event, context, callback);
    } else if(methodName === "GET") {
        module.exports.readOrder(event, context, callback);
    } else if(methodName === "PUT") {
        module.exports.updateOrder(event, context, callback);
    } else if(methodName === "DELETE") {
        module.exports.deleteOrder(event, context, callback);
    }
};


//order
module.exports.createOrder = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        if(!header.userName || !header.password) {
           throw "Please provide the required parameter in header to authenticate request.";
        }
        if(!body) {
            throw "Please provide the required parameter to create order.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, false)
        }).then(valdationRes => {
        	body.userId = valdationRes._id;
        	body.isActive = true;
        	body.isAllocated = false;
        	body.isDelivered = false;
        	body.created_at = new Date().toISOString();
            body.updated_at = new Date().toISOString();
            return LastmileStatus.findOne({status : '0', isActive : true}).lean();
        }).then(res => { 
        	if(!res) {
        		throw "Unfortunatly cannot place order, Please try after sometime."
        	}
        	body.statusId = res._id;
        	return RegionAreaMapping.findOne({areaCode : body.areaCodeId, isActive : true}).lean();
        }).then(regRes => {
        	if(!regRes) {
        		throw "Cannot place order since the region area code does't servicable."
        	}
        	body.areaCodeId = regRes._id;
            let orderObject = new Order(body);
            return orderObject.save();
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Order created Successfully.'
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

module.exports.readOrder = (event, context, callback) => {
	try {
		let header = !event.headers ? event : event.headers;
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
            return Order.find(pathParam).populate('areaCodeId').populate('statusId').populate('deliveryAgentId').populate('userId').lean();
        }).then(response => {
        	if(!response) {
        		throw "There is no such order exits in site data.";
        	}
        	context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'retrived order data Successfully.',
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

module.exports.updateOrder = (event, context, callback) => {
	try {
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0 || !pathParam.itemNo || !pathParam.orderNo) {
            throw "Please provide the orderNo and itemNOin the request path to delete the order data.";
        }
        if(!body) {
            throw "Please provide the required parameter to update order.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return Order.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such order_no exits in the order data , Please make sure passed order_no is correct. to update from order data."
            }
            body.updated_at = new Date().toISOString();
            return Order.update(pathParam, body);
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Order details updated Successfully as requested.'
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

module.exports.deleteOrder = (event, context, callback) => {
	try {
        let header = !event.headers ? event : event.headers;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0 || !pathParam.itemNo || !pathParam.orderNo) {
            throw "Please provide the orderNo and itemNOin the request path to delete the order data.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return Order.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such order_no exits in the order data , Please make sure passed order_no is correct to deleted from order data."
            }
            return Order.update(pathParam, {isActive : false});
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Order details deleted Successfully as requested.'
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



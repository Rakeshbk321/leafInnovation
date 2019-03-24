'use strict';

//basic db utilities
const dbUtil = require('./dbUtilities');

//model declartion
const Product = require('./models/product.model'),
    User = require('./models/user.model');;

//controller declaration
const ProductContoller = require('./controllers/productController'),
    UserContoller = require('./controllers/userController');


module.exports.product = (event, context, callback) => {
    let methodName = !event.method ? "POST" : event.method;    
    if(methodName === "POST") {
        module.exports.createProduct(event, context, callback);
    } else if(methodName === "GET") {
        module.exports.readProduct(event, context, callback);
    } else if(methodName === "PUT") {
        module.exports.updateProduct(event, context, callback);
    } else if(methodName === "DELETE") {
        module.exports.deleteProduct(event, context, callback);
    }
};

module.exports.createProduct = (event, context, callback) => {
    try {
        console.log("event-------", JSON.stringify(event));
        let  header = {userName : 'rakesh2964', 'password':'123rakesh'}//!event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(!body) {
            throw "Please provide the required parameter to create product.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            body.isActive = true;
            body.created_at = new Date().toISOString();
            body.updated_at = new Date().toISOString();
            let productObject = new Product(body);
            return productObject.save();
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Product created Successfully.'
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

module.exports.readProduct = (event, context, callback) => {
    try {
        console.log("event-------", JSON.stringify(event));
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
            return Product.find(pathParam);
        }).then(response => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'retrived product data Successfully.',
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

module.exports.updateProduct = (event, context, callback) => {
    try {
        console.log("event-------", JSON.stringify(event));
        let  header = !event.headers ? event : event.headers;
        let body = !event.body ? event : event.body;
        let pathParam = !event.path ? (!event ? {} : event) : event.path;
        if(!header.userName || !header.password) {
            throw "Please provide the required parameter in header to authenticate request.";
        }
        if(Object.keys(pathParam).length === 0) {
            throw "Please provide the sku in the request path to update the product data.";
        }
        if(!body) {
            throw "Please provide the required parameter to update product.";
        }
        dbUtil.connect()
        .then(db => {
            global.db = db;
            return UserContoller.validateRequest(User, header, true)
        }).then(valdationRes => {
            pathParam.isActive = true;
            return Product.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such SKU exits in the product data , Please make sure passed sku is correct. to update from product data."
            }
            body.updated_at = new Date().toISOString();
            return Product.update(pathParam, body);
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Product details updated Successfully as requested.'
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

module.exports.deleteProduct = (event, context, callback) => {
    try {
        console.log("event-------", JSON.stringify(event));
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
            return Product.findOne(pathParam);
        }).then(response => {
            if(!response) {
                throw "No such SKU exits in the product data , Please make sure passed sku is correct to deleted from product data."
            }
            return Product.update(pathParam, {isActive : false, updated_at : new Date().toISOString()});
        }).then(saveRes => {
            context.callbackWaitsForEmptyEventLoop = false;
            dbUtil.disConnect();
            return callback(null, {
                statusCode : 200,
                status : "Success",
                message : 'Product details deleted Successfully as requested.'
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

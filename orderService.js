'use strict';

const async = require('async');

//basic db utilities
const dbUtil = require('./dbUtilities');

//model declartion
const Order = require('./models/order.model'),
	User = require('./models/user.model'),
	DeliveryAgent = require('./models/deliveryAgent.model'),
	Inventory = require('./models/inventory.model'),
	RegionAreaMapping = require('./models/regionAreaMapping.model'),
	Region = require('./models/region.model'),
	LastmileStatus = require('./models/lastmileStatus.model');

//controller declaration
const OrderContoller = require('./controllers/orderController'),
	UserContoller = require('./controllers/userController');

let orderServiceFns = {};
let ObjectId = require('mongodb').ObjectID;

module.exports.schduleServices = (event, context, callback) => {
	
	dbUtil.connect().then(res => {
		return Promise.all(
			[
				orderServiceFns['allocateOrderToStore'](),
				orderServiceFns['allocateToLastmile'](),
				orderServiceFns['updateTrackingDetails']()
			]
		);
	}).then(response => {
		dbUtil.disConnect();
        context.callbackWaitsForEmptyEventLoop = false;
        return callback(null, {
            statusCode : 200,
            status : "Success",
            message : 'Scheduler ran Successfully..',
            data : response
        });
	}).catch(err => {
		dbUtil.disConnect();
        context.callbackWaitsForEmptyEventLoop = false;
        return callback(null, {
            statusCode : 200,
            status : "Success",
            message : 'Scheduler not ran Successfully..',
            data : err
        });
	});
}


if(typeof orderServiceFns.allocateOrderToStore === 'undefined') {
    orderServiceFns.allocateOrderToStore = () => {
    	return new Promise((resolve, reject) => {
    		return Order.find({isAllocated : false, isActive : true})
    		.lean().then(orderResult => {
    			if(Array.isArray(orderResult) && orderResult.length == 0 ) {
    				resolve("There is no order to allocate to store at the moment.");
    			}
    			let allocateFn = [];
    			allocateFn.push((dummyCb) => {
    				return dummyCb(null, true);
    			});
    			if(orderResult.length === 0) {
    				throw "There are no order to allocate orders to store."
    			}
    			for(let index = 0; index < orderResult.length; index++) {
    				let orderData = orderResult[index];
    				let allocationStoreName = null;
    				allocateFn.push(
    					(prevFlag, orderAllocateCb) => {
    						let sku = orderData.sku;
    						return Inventory.findOne({sku : sku, isActive : true})
    						.then(inventoryRes => {
    							console.log("inventoryRes : ", inventoryRes.qty, orderData.qtyOrdered);
    							if(!inventoryRes) {
    								throw "Order cannot be allocated at the moment.";
    							} else if(inventoryRes.qty < orderData.qtyOrdered) {
    								throw "Inventory is not exist to allocate order."
    							} else {
    								allocationStoreName = inventoryRes.storeName;
    								return Inventory.update({sku : sku, isActive : true},{$inc : {qty : - orderData.qtyOrdered}});
    							}    							
    						}).then(response => {
    							return LastmileStatus.findOne({status : 1, isActive : true});	    							
    						}).then(statusRes => {
    							if(!statusRes) {
									throw "There is no such status exists in the status to update.";
								} else {
									return Order.update({orderNo : orderData.orderNo, itemNo : orderData.itemNo, isActive : true},{$set : {statusId : new ObjectId(statusRes._id), allocationStoreName : allocationStoreName, isAllocated : true}});
								}							
    						}).then(response => {
    							return orderAllocateCb(null, "Order"+orderData.orderNo+"("+orderData.itemNo+")"+" has been allocated.");
    						}).catch(err => {
    							return orderAllocateCb(null, "Error: "+err);
    						});
    					}
    				);
    				if(index === orderResult.length-1) {
    					async.waterfall(
    						allocateFn,
    						(err, res) => {
    							return resolve(res);
    						}
    					);
    				}
    			}
    		}).catch(err => {
    			console.log(err);
    			return resolve(err)
    		});
    	});
    };
}



if(typeof orderServiceFns.allocateToLastmile === 'undefined') {
    orderServiceFns.allocateToLastmile = () => {
    	return new Promise((resolve, reject) => {
    		return Order.find({
    			isAllocated : true,
    			deliveryAgentId : {$in : [null]}
    		}).populate('areaCodeId').lean()
    		.then(orderResult => {
    			let allocateFn = [];
    			allocateFn.push((dummyCb) => {
    				return dummyCb(null, true);
    			});
    			if(orderResult.length === 0) {
    				throw "There are no order to allocate lastmileStatus.";
    			}
    			for(let index = 0; index < orderResult.length; index++) {
    				let orderData = orderResult[index];
    				let regionAreaMapping = orderData['areaCodeId'];
    				let delAgentData = null;
    				allocateFn.push(
    					(prevFlag, allocateCb) => {
    						return RegionAreaMapping.findOne({areaCode : regionAreaMapping.areaCode, isActive : true}).populate('regionId')
    						.then(res => {
    							console.log("region--", res);
    							if(!res) {
    								throw "There is no such region exists in system.";
    							} else {
    								return DeliveryAgent.findOne({isBusy : false, agentRegionId : new ObjectId(res.regionId._id), isActive : true});
    							}
    						}).then(agentData => {
    							console.log("agentData--", agentData);
    							if(!agentData) {
    								throw "All deliveryAgents are busy with delivering order please wait for while.";
    							} else {
    								delAgentData = agentData;
    								return LastmileStatus.findOne({status : 2, isActive : true});
    							}    							
    						}).then(statusRes => {
    							console.log("statusRes--", statusRes);
    							if(!statusRes) {
    								throw "There is no such state exits in site,";
    							} else {
    								return Order.update({
    									orderNo : orderData.orderNo,
    									itemNo : orderData.itemNo
    								}, {
    									statusId : new ObjectId(statusRes._id),
    									deliveryAgentId : new ObjectId(delAgentData._id),
    									updated_at : new Date().toISOString()
    								})
    							}
    						}).then(res => {
    							return DeliveryAgent.update({_id : new ObjectId(delAgentData._id)},{isBusy : true});
    						}).then(result => {
    							return allocateCb(null, "Order"+orderData.orderNo+"("+orderData.itemNo+")"+" has been handover to delivery agent.");
    						}).catch(err => {
    							return allocateCb(null, err);
    						});
    					}
    				);
    				if(index === orderResult.length-1) {
    					async.waterfall(
    						allocateFn,
    						(err, res) => {
    							resolve(res);
    						}
    					);
    				}
    			}
    		}).catch(err => {
    			return resolve(err)
    		});
    	});
    };
}


if(typeof orderServiceFns.updateTrackingDetails === 'undefined') {
    orderServiceFns.updateTrackingDetails = () => {
    	return new Promise((resolve, reject) => {
    		return Order.find({
    			deliveryAgentId : {$exists : true},
    			isAllocated : true,
    			isDelivered : false
    		}).populate('areaCodeId').lean().then(orderResult => {
    			let trackUpdateFn = [];
    			trackUpdateFn.push((dummyCb) => {
    				return dummyCb(null, true);
    			});
    			if(orderResult.length === 0) {
    				throw "There are no order to update tracking number.";
    			}
    			for(let index = 0; index < orderResult.length; index++) {
    				let orderData = orderResult[index];
    				let regionAreaMapping = orderData['areaCodeId'];
    				let distance = regionAreaMapping.distance;    					
    				trackUpdateFn.push(
    					(prevFlag, updateCb) => {
    						if(!orderData.trackingOrderCount) {
    							if(orderData.trackingOrderCount === 0) {
    								let status = 6;
    								return LastmileStatus.findOne({status : status, isActive : true})
			    					.then(statusRes => {
			    						if(!statusRes) {
			    							throw "There is no such status exists in system";
			    						} else {
			    							return Order.update({
			    								orderNo : orderData.orderNo,
			    								itemNo : orderData.itemNo,
			    								isAllocated : true
			    							},{
			    								isDelivered : true,
			    								$inc : { trackingOrderCount : -1 },
			    								statusId : new ObjectId(statusRes._id)
			    							});
			    						}
		    						}).then(result => {
		    							return DeliveryAgent.update({
		    								_id : new ObjectId(orderData.deliveryAgentId)
		    							},{
		    								isBusy : false
		    							});
		    						}).then(result => {
			    						return updateCb(null, "Order"+orderData.orderNo+"("+orderData.itemNo+")"+" update the tracking order status.");
			    					}).catch(err => {
			    						console.log("er-1", err);
			    						return updateCb(null, err);
			    					})
    							} else {
    								return LastmileStatus.findOne({status : 3, isActive : true})
			    					.then(statusRes => {
			    						if(!statusRes) {
			    							throw "There is no such status exists in system";
			    						} else {
			    							return Order.update({
			    								orderNo : orderData.orderNo,
			    								itemNo : orderData.itemNo,
			    								isAllocated : true
			    							},{
			    								trackingOrderCount : distance,
			    								statusId : new ObjectId(statusRes._id)
			    							});
			    						}
			    					}).then(res => {
			    						return updateCb(null, "Order"+orderData.orderNo+"("+orderData.itemNo+")"+" update the tracking status..");
			    					}).catch(err => {
			    						return updateCb(null, err);
			    					});	
    							}    							
			    			} else {
			    				console.log("am herer---------1");
			    				let prevTrackingDistance = orderData.trackingOrderCount;
			    				let status = null;
			    				if(distance/2 == prevTrackingDistance) {
			    					status = 4;
			    				} else if(prevTrackingDistance == 1){
			    					status = 5;
			    				} else if(prevTrackingDistance == 0) {
			    					status = 6
			    				}
			    				console.log("am herer---------2");
			    				if(!status) {
			    					console.log("am herer---------3");
			    					Order.update({
			    						orderNo : orderData.orderNo,
	    								itemNo : orderData.itemNo,
	    								isAllocated : true
			    					},{
			    						$inc : { trackingOrderCount : -1},
			    						updated_at : new Date().toISOString()
			    					}).then(result => {
			    						console.log("am herer---------4");
			    						return updateCb(null, "Order"+orderData.orderNo+"("+orderData.itemNo+")"+" update the trackingOrderCount..");
			    					}).catch(err => {
			    						console.log("am herer---------5");
			    						console.log("er-21", err);
			    						updateCb(null, err);
			    					});
			    				} else {
			    					return LastmileStatus.findOne({status : status, isActive : true})
			    					.then(statusRes => {
			    						console.log("statusRes-----", statusRes);
			    						if(!statusRes) {
			    							throw "There is no such status exists in system";
			    						} else {
			    							return Order.update({
			    								orderNo : orderData.orderNo,
			    								itemNo : orderData.itemNo,
			    								isAllocated : true
			    							},{
			    								$inc : { trackingOrderCount : -1 },
			    								statusId : new ObjectId(statusRes._id)
			    							});
			    						}
		    						}).then(result => {
			    						return updateCb(null, "Order"+orderData.orderNo+"("+orderData.itemNo+")"+" update the tracking order status.");
			    					}).catch(err => {
			    						console.log("er-1", err);
			    						return updateCb(null, err);
			    					});
			    				}
			    			}
    					}
    				);    				
    				if(index === orderResult.length-1) {
    					async.waterfall(
    						trackUpdateFn,
    						(err, res) => {
    							//dbUtil.disConnect();
    							return resolve(res);
    						}
    					);
    				}
    			}	
    		}).catch(err => {
    			return resolve(err)
    		});
    	});
    };
};
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var orderSchema = new Schema({
	orderNo: {	
		type: String,
        required: true,
        index: true,
        unique: true
    },
    itemNo: {
		type: String,
        required: true,
        index: true,
        unique: false
    },
    statusId: {
    	type : Schema.Types.ObjectId,
		ref : 'lastmileStatus',
        required: false,
        index: true,
        unique: false
    },
    shortDesc: {
		type: String,
		required: true,
        index: true,
        unique: false
    },
	sku: {
		type: String,
		required: true,
        index: true,
        unique: false
    },
    color: {
		type: String,
		required: false,
        index: true,
        unique: false
    },
    size: {
		type: String,
		required: true,
        index: true,
        unique: false
    },
    qtyOrdered: {
		type: Number,
		required: true,
        index: false,
        unique: false
    },
    paymentMethod: {
		type: String,
		required: true,
        index: false,
        unique: false
    },
    mrp: {
		type: Number,
		required: true,
        index: false,
        unique: false
    },
    price: {
		type: Number,
		required: true,
        index: false,
        unique: false
    },
    areaCodeId: {
        type : Schema.Types.ObjectId,
        ref : 'regionAreaMappingSchema',
        required: true,
        index: true,
        unique: false
    },
    deliveryAgentId: {
        type : Schema.Types.ObjectId,
        ref : 'deliveryAgent',
        required: false,
        index: false,
        unique: false
    },
    allocationStoreName : {
    	type : String,
    	required : false,
    	index : true,
    	unique : false
    },
    isAllocated : {
    	type : Boolean,
    	required : false,
    	index : true,
    	unique : false
    },
    isDelivered : {
    	type : Boolean,
    	required : false,
    	index : false,
    	unique : false
    },
    trackingOrderCount : {
    	type : Number,
    	required : false,
    	index : false,
    	unique : false
    },
    userId : {
    	type : Schema.Types.ObjectId,
    	ref : 'user',
    	required : true,
    	index : true,
    	unique :false
    },
    order_date: Date,
    created_at: Date,
	updated_at: Date,
	isActive : {
    	type : Boolean,
    	required : false,
    	index : true,
    	unique : false
    }
});

orderSchema.index({ orderNo: 1, itemNo : 1 },{ unique : true});

module.exports = mongoose.model('order', orderSchema);
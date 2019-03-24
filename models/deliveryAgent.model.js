'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var deliveryAgentSchema = new Schema({
	agentFirstName: {
		type : String,
		required : true,
		index: false,
        unique: false
	},
	agentLastName: {
		type : String,
		required : true,
		index: false,
        unique: false
	},
	agentUserName: {
		type : String,
		required : true,
		index: true,
        unique: true
	},
	agentCode: {
		type : String,
		required : true,
		index: true,
        unique: true
	},
	agentRegionId: {
		type : Schema.Types.ObjectId,
		ref : 'region',
        required: true,
        index: true,
        unique: false
	},
	password: { 
		type: String, 
		required: true,
		index: false,
        unique: false 
	},
	totalOrderDelivered : {
		type : Number,
		required : false,
		index : false,
		unique : false
	},
	isBusy : {
		type : Boolean,
		required : false,
		index : false,
		unique : false	
	},
	created_at: Date,
	updated_at: Date,
	isActive : {
    	type : Boolean,
    	required : false,
    	index : true,
    	unique : false
    }
});

module.exports = mongoose.model('deliveryAgents', deliveryAgentSchema);



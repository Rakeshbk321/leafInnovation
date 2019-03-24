'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var inventorySchema = new Schema({
	sku: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    qty: {
        type: Number,
        required: true,
        index: false,
        unique: false
    },
    storeName: {
        type: String,
        required: true,
        index: true,
        unique: false
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

module.exports = mongoose.model('inventory', inventorySchema);

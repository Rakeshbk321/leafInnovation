'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var regionAreaMappingSchema = new Schema({
	name: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    areaCode : {
        type: String,
        required: true,
        index: true,
        unique: true  
    },
    regionId: {
        type : Schema.Types.ObjectId,
        ref : 'region',
        required: true,
        index: true,
        unique: false
    },
    distance : {
        type: Number,
        required: true,
        index: false,
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

module.exports = mongoose.model('regionAreaMappingSchema', regionAreaMappingSchema);

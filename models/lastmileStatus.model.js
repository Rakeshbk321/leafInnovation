'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var lastmileStatusSchema = new Schema({
	name: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    distance : {
        type : Number,
        required : false,
        index : false,
        unique : false
    },
    status : {
        type : Number,
        required : true,
        index : true,
        unique : true
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

module.exports = mongoose.model('lastmileStatus', lastmileStatusSchema);

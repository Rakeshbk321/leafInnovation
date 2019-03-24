'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
	firstName: {
		type : String,
		required : true,
		index: false,
        unique: false
	},
	lastName: {
		type : String,
		required : true,
		index: false,
        unique: false
	},
	userName: {
		type: String, 
		required: true, 
		unique: true,
		index : true 
	},
	password: { 
		type: String, 
		required: true,
		index: false,
        unique: false 
	},
	location: { 
		type: String, 
		required: true,
		index: true,
        unique: false 
	},
	age: { 
		type: String, 
		required: true,
		index: true,
        unique: false
	},
	created_at: Date,
	updated_at: Date,
	accountType : {
		type : String,
		required : true,
		unique : false,
		index  :false
	},
	isActive : {
    	type : Boolean,
    	required : false,
    	index : true,
    	unique : false
    }
});

module.exports = mongoose.model('user', userSchema);



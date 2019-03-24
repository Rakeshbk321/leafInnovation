'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var regionSchema = new Schema({
	name: {
        type: String,
        required: true,
        index: true,
        unique: true
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

module.exports = mongoose.model('region', regionSchema);

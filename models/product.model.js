'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var productSchema = new Schema({
	sku: {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    styleNo: {
      type: String,
      required: false,
      index: false,
      unique: false
    },
    name: {
      type: String,
      required: true,
      index: false,
      unique: false
    },
    productDesc: {
      type: String,
      required: false,
      index: false,
      unique: false
    },
    mrp: {
      type: Number,
      required: false,
      index: false,
      unique: false
    },
    price: {
      type: Number,
      required: false,
      hidden: false,
      index: false,
      unique: false
    },
    hsn: {
      type: String,
      required: true,
      hidden: false,
      index: false,
      unique: false
    },
    colour: {
      type: String,
      required: false,
      hidden: false,
      index: false,
      unique: false
    },
    size: {
      type: String,
      required: true,
      hidden: false,
      index: false,
      unique: false
    },
    gender: {
      type: String,
      required: false,
      hidden: false,
      index: false,
      unique: false
    },
    category: {
      type: Schema.Types.Mixed,
      required: true,
      hidden: false,
      index: false,
      unique: false
    },
    weight: {
      type: String,
      required: false,
      hidden: false,
      index: false,
      unique: false
    },
    productDimension: {
      type: String,
      required: false,
      hidden: false,
      index: false,
      unique: false
    },
    imageLink1: {
      type: String,
      required: false,
      hidden: false,
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

module.exports = mongoose.model('product', productSchema);



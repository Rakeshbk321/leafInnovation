'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;


module.exports = {
	create : (UserModel, body) => {
		return new Promise((resolve, reject) => {
			let password = body.password;
			bcrypt.hash(password, saltRounds, (err, hash) => {
				if(err) {
					 reject(err);
				}
				body.password = hash;
				var userObject = new UserModel(body);
				return userObject.save()
				.then(res => { 
					resolve(res)
				})
				.catch(err => {
					reject(err)
				});
			});
		});			
	},

	update : () => {

	},

	delete : () => {

	},

	read : () => {
		
	},

	validateRequest : (UserModel, requestData, isAdmin = false) => {
		return new Promise((resolve, reject) => {
			let userData = null;
			UserModel.findOne({
				userName : requestData.userName,
				isActive :true
			}).lean().then(result => {
				if(!result) {
					throw "Request cannot be completed, Since passed user details are wrong.. Please make sure passed data is correct.";
				}
				userData = result;

				return bcrypt.compare(requestData.password, userData.password);
			}).then(res => {
				if (res == true) {
	        		let resResolved = true;
	        		if(isAdmin) {
	        			resResolved = false;
	        			if(userData.accountType === 'admin') {
	        				resResolved = true;
	        			} else {
	        				throw "Requested action cannot be performed, Plase make sure your admin to perform the operation.";
	        			}
	        		}
	        		if(resResolved) {
	        			return resolve(userData);
	        		}		        				        		
		        } else {
		        	throw "Request cannot be completed, Since passed user password does't match. Please make sure passed data is correct.";
	    	    }
	    	}).catch(er => {
	    		reject(er)
			});			
		});
	}
}
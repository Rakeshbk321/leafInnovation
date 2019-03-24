'use strict';

module.exports = {
	
	validateRequest : (model, regionName) => {
		return new Promise((resolve, reject) => {
			return model.findOne({
				name : regionName,
				isActive : true
			}).lean().then(result => {
				if(!result) {
					throw  "There is not such "+regionName+", exits in the system please check the region name.";
				}
				return resolve(result);
			}).catch(err => {
				return reject(err);
			})
		});
	}
}
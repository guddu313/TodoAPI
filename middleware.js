var cryptojs = require('crypto-js');

module.exports = function(db) {
	return {
		//for any middleware there are three requests and it will executed before the actual handler
		requireAuthentication: function(req,res,next){
			var token = req.get('Auth') || '';
			
			db.token.findOne({
				where: {
					tokenHash: cryptojs.MD5(token).toString()
				}
			}).then(function(tokenInstance){
				if(!tokenInstance)
				{
					throw new Error();
				}
				req.token = tokenInstance;
				return db.user.findbyToken(token);
			}).then(function(user){
				req.user = user;
				next();
			}).catch(function(e){
				console.error(e);
				res.status(401).send();
			});
		}		
	};
};
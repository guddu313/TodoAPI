module.exports = function(db) {
	return {
		//for any middleware there are three requests and it will executed before the actual handler
		requireAuthentication: function(req,res,next){
			var token = req.get('Auth');
			
			db.user.findbyToken(token).then(function(user){
				req.user = user;
				next();
			},function(){
				res.status(401).send();
			});
		}		
	};
};
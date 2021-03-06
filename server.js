var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);


var app = express();
var PORT = process.env.PORT || 3000
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req,res){
	res.send('Todo API Root');
});

//Get request /todos
app.get('/todos',middleware.requireAuthentication,function(req,res){
	
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};
	
	if(query.hasOwnProperty('completed'))
	{
		if(query.completed === 'true')
		{
			where.completed = true;			
		}
		else
		{
			where.completed = false;	
		}
	}
	
	if(query.hasOwnProperty('q') && query.q.length > 0)
	{
		where.description = {
			$like: '%' + query.q + '%'
		};
	}
	
	db.todo.findAll({
		where: where
	}).then(function(todo){
		res.json(todo);
	},function(e){
		res.status(500).send();
	});
});

//Get /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req,res){
	var todoId = parseInt(req.params.id, 10);
	
	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo){
		if(todo)
		{
			res.json(todo.toJSON());
		}
		else
		{
			res.status(404).send();
		}
	},function(e){
		res.status(500).send();
	});
});

app.post('/todos', middleware.requireAuthentication, function(req, res){
	//var body = req.body;
	var body = _.pick(req.body, 'description', 'completed');
	
	db.todo.create(body).then(function(data){
		req.user.addTodo(data).then(function(){
			return data.reload();
		}).then(function(todo){
			res.json(data.toJSON());
		});
	},function(e){
		res.status(400).json(e);
	});
	
});

//delete the request
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res){
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted){
		if(rowsDeleted === 0)
		{
			res.status(404).json({
				"Error": "No Parameter Id found!!!"
			});
		}
		else
		{
			res.status(204).send();
		}
	},function(){
		res.status(500).send();
	});
});

//update the array
//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res){
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var Attributes = {};
	
	//Checking for completed property
	if(body.hasOwnProperty('completed'))
	{
		Attributes.completed = body.completed;
	}	
	//Checking for description property
	if(body.hasOwnProperty('description'))
	{
		Attributes.description = body.description;
	}
	
	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo){
		if(todo)
		{
			todo.update(Attributes).then(function(todo){
										res.json(todo.toJSON());
									},function(e){
										res.status(400).json(e);
									});
		}
		else
		{
			res.status(404).send();
		}
	},function(){
		res.status(500).send();
	});

});

app.post('/users', function(req,res){
	var body = _.pick(req.body, 'email', 'password');
	
	db.user.create(body).then(function(data){
		res.json(data.toPublicJSON());
	},function(e){
		res.status(400).json(e);
	});
});

//POST /users/login
app.post('/users/login', function(req,res){
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;
	
	db.user.authenticate(body).then(function(user){
		//Generate the token
		var token = user.generateToken('authentication');
		userInstance = user;
		//Save the token in database
		return db.token.create({
			token: token
		});
		
	}).then(function(tokenInstance){
		res.header('Auth',tokenInstance.get('token')).json(userInstance.toPublicJSON());
		
	}).catch(function(e){
		res.status(401).send();
	});
});

//DELETE/users/login
app.delete('/users/login', middleware.requireAuthentication, function(req, res){
	req.token.destroy().then(function(){
		res.status(204).send();
	}).catch(function(){
		res.status(500).send();
	});
});

db.sequelize.sync({force:true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});


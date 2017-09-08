var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


var app = express();
var PORT = process.env.PORT || 3000
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req,res){
	res.send('Todo API Root');
});

//Get request /todos
app.get('/todos', function(req,res){
	
	var query = req.query;
	var where = {};
	
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
app.get('/todos/:id', function(req,res){
	var todoId = parseInt(req.params.id, 10);
	
	db.todo.findById(todoId).then(function(todo){
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

app.post('/todos', function(req, res){
	//var body = req.body;
	var body = _.pick(req.body, 'description', 'completed');
	
	db.todo.create(body).then(function(data){
		res.json(data.toJSON());
	},function(e){
		res.status(400).json(e);
	});
	
});

//delete the request
app.delete('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
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
app.put('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};
	var matchedId = _.findWhere(todos, {id: todoId});
	
	if(!matchedId)
	{
		return res.status(404).send();
	}
	
	//Checking for completed property
	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed))
	{
		validAttributes.completed = body.completed;
	}
	else if(body.hasOwnProperty('completed'))
	{
		return res.status(400).send();
	}
	
	//Checking for description property
	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().lenght > 0)
	{
		validAttributes.description = body.description;
	}
	else if(body.hasOwnProperty('description'))
	{
		return res.status(400).send();
	}
	
	_.extend(matchedId, validAttributes);
	res.json(matchedId);
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});


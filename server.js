var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
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
	res.json(todos);
});

//Get /todos/:id
app.get('/todos/:id', function(req,res){
	var todoId = parseInt(req.params.id, 10);
	var matchedId = _.findWhere(todos, {id: todoId});
	//res.send('Asking for todo with id of ' + req.params.id)
	
	if(matchedId)
	{
		res.json(matchedId);
	}
	else
	{
		res.status(404).send();
	}

});

app.post('/todos', function(req, res){
	//var body = req.body;
	var body = _.pick(req.body, 'description', 'completed');
	
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0)
	{
		return res.status(400).send();
	}
	
	body.description = body.description.trim();
	
	//add id field
	body.id = todoNextId++;
	
	//push the data into array
	todos.push(body);
	//console.log('description: ' + body.description);
	
	res.json(body);
});

//delete the request
app.delete('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);
	var matchedId = _.findWhere(todos, {id: todoId});
	
	if(matchedId)
	{
		todos = _.without(todos,matchedId);
		res.json(matchedId);
		
	}
	else
	{
		res.status(404).json({"Ërror": "No paramter Id found!!"});
	}
});

app.listen(PORT, function(){
	console.log('Express listening on port '+ PORT + '!');
});
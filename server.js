var express = require('express');
var bodyParser = require('body-parser');
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
	var matchedId;
	//res.send('Asking for todo with id of ' + req.params.id)
	
	//find the id
	todos.forEach(function(todo){
		if(todoId === todo.id)
		{
			matchedId = todo;
		}
	});
	
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
	var body = req.body;
	
	//add id field
	body.id = todoNextId++;
	
	//push the data into array
	todos.push(body);
	//console.log('description: ' + body.description);
	
	res.json(body);
});

app.listen(PORT, function(){
	console.log('Express listening on port '+ PORT + '!');
});
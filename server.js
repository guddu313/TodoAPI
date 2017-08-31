var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000
var todos = [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false
},{
	id: 2,
	description: 'Go to Market',
	completed: false
},{
	id: 3,
	description: 'Go to office',
	completed: true
}];

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

app.listen(PORT, function(){
	console.log('Express listening on port '+ PORT + '!');
});
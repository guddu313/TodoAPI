var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo',{
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1,250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

var user = sequelize.define('user',{
	email: Sequelize.STRING
});

Todo.belongsTo(user);
user.hasMany(Todo);

sequelize.sync().then(function(){
	console.log('Everything is synced');
	user.create({
		email: 'learning@gmail.com'
	}).then(function(){
		return Todo.create({
			description: 'Clean the yard'
		});
	}).then(function(todo){
		user.findById(1).then(function(user){
			user.addTodo(todo);
		});
	});
});
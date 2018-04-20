const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const UsersService = require('./UsersService');
const userService = new UsersService();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	socket.on('disconnect', () => {
		userService.removeUser(socket.id);
		socket.broadcast.emit('update', {
			users: userService.getAllUsers()
		});
	});
	socket.on('message', function(message){
		let msg = message.text.trim();
		if (msg.substr(0, 1) === '@') {
			msg = msg.substr(1);
			const space = msg.indexOf(' ');
			let receiver = msg.substr(0, space);
			msg = msg.substr(space + 1);
			const user = userService.getUserByName(receiver);
			//{name} = userService.getUserByName(socket.name);
			//console.log(user.id);
			//console.log(user.name)
			const {name} = userService.getUserById(socket.id);
			console.log(receiver)
			console.log(name)

			socket.to(user.id).emit('message', {
				text: msg,
				from: name
			});			
		} else {
			const {name} = userService.getUserById(socket.id);
			socket.broadcast.emit('message', {
				text: message.text,
				from: name
			});
		}
	});
	socket.on('join', function(name){
		userService.addUser({
			id: socket.id,
			name
		});
		io.emit('update', {
			users: userService.getAllUsers()
		});
	});
});

server.listen(3000, function(){
	console.log('listening on *:3000');
});
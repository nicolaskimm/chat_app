const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const UsersService = require('./UsersService');
const userService = new UsersService();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chat', function(err){
	if(err){
		console.log(err)
	} else {
		console.log('db loaded')
	}
});

const Schema = mongoose.Schema;

const chatSchema = new Schema({
	username: String,
	msg: String,
	rooms: String
});

const Chat = mongoose.model('Message', chatSchema);

app.use(express.static(__dirname + '/public'));

app.get('/chat_app', function(req, res){
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
			const {name} = userService.getUserById(socket.id);

			socket.to(user.id).emit('message', {
				text: msg,
				from: name + ' (whispering)'
			});			
		} else {
			const {name} = userService.getUserById(socket.id);
			const newMsg = new Chat({msg: message.text, username: name});
			newMsg.save(function(err){
				if (err) throw err;
				socket.broadcast.emit('message', {
					text: message.text,
					from: name
				});
			});
		}
	});

	socket.on('join', function(name, room){
		userService.addUser({
			id: socket.id,
			name,
		});

		io.emit('update', {
			users: userService.getAllUsers()
		});
		Chat.find({}, function (err, array) {
			if (err) throw err;

			for (let i = array.length - 1 ; i > -1 ; i--) {
				socket.emit('message', {
					text: array[i].msg,
					from: array[i].username
				})
			};
		});
	});
});

server.listen(3000, function(){
	console.log('listening on *:3000');
});
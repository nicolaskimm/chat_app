class UsersService {
	constructor() {
		this.users = [];
	}
  
	getAllUsers() {
		return this.users;
	}
  
	getUserById(userId) {
		return this.users.find(user => user.id === userId);
	}

	getUserByName(userName) {
		return this.users.find(user => user.name === userName);
	}
  
	addUser(user) {
		this.users = [user, ...this.users];
	}
  
	removeUser(userId) {
		this.users = this.users.filter(user => user.id !== userId);
	}
}

module.exports = UsersService;
const bcrypt = require('bcryptjs');

class User {
  constructor(userData) {
    this._id = global.userIdCounter++;
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Hash password before saving
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Compare password method
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Remove password from JSON response
  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }

  // Save user to in-memory storage
  async save() {
    await this.hashPassword();
    
    // Check if user already exists
    const existingUser = global.users.find(u => 
      u.email === this.email || u.username === this.username
    );
    
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    global.users.push(this);
    return this;
  }

  // Static methods
  static async findOne(query) {
    return global.users.find(user => {
      if (query.email) return user.email === query.email;
      if (query.username) return user.username === query.username;
      if (query._id) return user._id === query._id;
      if (query.$or) {
        return query.$or.some(condition => {
          if (condition.email) return user.email === condition.email;
          if (condition.username) return user.username === condition.username;
          return false;
        });
      }
      return false;
    });
  }

  static async findById(id) {
    return global.users.find(user => user._id === parseInt(id));
  }
}

module.exports = User; 
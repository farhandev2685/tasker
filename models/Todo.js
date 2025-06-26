class Todo {
  constructor(todoData) {
    this._id = global.todoIdCounter++;
    this.title = todoData.title;
    this.description = todoData.description || '';
    this.dueDate = todoData.dueDate ? new Date(todoData.dueDate) : null;
    this.status = todoData.status || 'pending';
    this.completed = todoData.completed || false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Save todo to in-memory storage
  async save() {
    global.todos.push(this);
    return this;
  }

  // Static methods
  static async find(query) {
    let results = global.todos;
    
    // Sort by createdAt descending (newest first)
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findOne(query) {
    return global.todos.find(todo => {
      if (query._id) return todo._id === parseInt(query._id);
      return false;
    });
  }

  static async findOneAndDelete(query) {
    const index = global.todos.findIndex(todo => {
      if (query._id) return todo._id === parseInt(query._id);
      return false;
    });
    
    if (index !== -1) {
      return global.todos.splice(index, 1)[0];
    }
    return null;
  }

  // Update todo
  async updateOne(updates) {
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        this[key] = updates[key];
      }
    });
    this.updatedAt = new Date();
    return this;
  }
}

module.exports = Todo; 
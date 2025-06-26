module.exports = {
  PORT: process.env.PORT || 5000,
  // Try MongoDB Atlas first, then fall back to local MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 
               process.env.MONGODB_ATLAS_URI || 
               'mongodb://localhost:27017/todo-app',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d'
}; 
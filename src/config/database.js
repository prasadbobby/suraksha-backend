const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Ensure MongoDB URI is provided (Atlas only, no local fallback)
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required for MongoDB Atlas connection');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
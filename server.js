const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const transactionRoutes = require('./src/routes/transaction.routes');

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

if (!mongoUri) {
  console.error('✗ MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

// Artık direkt IP'lere gittiğimiz için standart Mongoose bağlantısı yeterli
async function connectToMongoDB() {
  try {
    console.log('\n📡 Initiating DIRECT MongoDB connection...');
    
    await mongoose.connect(mongoUri);
    
    console.log('✓ Connected to MongoDB Atlas successfully!\n');
    
    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
      console.log(`📍 Transaction API: POST http://localhost:${port}/api/transactions`);
    });

  } catch (error) {
    console.error('\n✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

connectToMongoDB();
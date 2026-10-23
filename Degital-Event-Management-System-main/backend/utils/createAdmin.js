const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    await connectDB();

    const { name, email, password } = {
      name: process.argv[2] || 'Admin User',
      email: process.argv[3] || 'admin@example.com',
      password: process.argv[4] || 'admin123'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('Admin user already exists with this email.');
        process.exit(0);
      } else {
        // Update existing user to admin
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('User updated to admin role.');
        process.exit(0);
      }
    }

    // Create new admin user
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();

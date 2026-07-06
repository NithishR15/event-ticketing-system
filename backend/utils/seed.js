// Run with: npm run seed
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');

const seed = async () => {
  await connectDB();

  // Create default admin if not exists
  const adminExists = await User.findOne({ email: 'admin@eventticketing.com' });
  if (!adminExists) {
    await User.create({
      name: 'System Admin',
      email: 'admin@eventticketing.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Default admin created: admin@eventticketing.com / Admin@123');
  } else {
    console.log('Admin already exists, skipping.');
  }

  // Seed default categories
  const defaultCategories = [
    'Technical',
    'Cultural',
    'Sports',
    'Workshop',
    'Seminar',
    'Hackathon',
    'Conference',
    'Concert',
  ];

  for (const name of defaultCategories) {
    const exists = await Category.findOne({ name });
    if (!exists) {
      await Category.create({ name });
    }
  }
  console.log('Categories seeded.');

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

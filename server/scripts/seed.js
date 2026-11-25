const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');

const defaultDepartments = [
  { name: 'Computer Science and Engineering', code: 'CSE' },
  { name: 'Electronics and Communication Engineering', code: 'ECE' },
  { name: 'Electrical and Electronics Engineering', code: 'EEE' },
  { name: 'Mechanical Engineering', code: 'ME' },
  { name: 'Civil Engineering', code: 'CIVIL' },
  { name: 'Information Technology', code: 'IT' }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Seeding database...');

    // 1. Seed departments if missing
    for (const dept of defaultDepartments) {
      const existing = await Department.findOne({
        $or: [{ code: dept.code }, { name: dept.name }]
      });
      if (!existing) {
        await Department.create(dept);
        console.log(`Created department: ${dept.code} (${dept.name})`);
      } else {
        console.log(`Department already exists: ${dept.code}`);
      }
    }

    // 2. Seed Admin from ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase().trim() : 'admin@college.com';
    const adminName = process.env.ADMIN_NAME || 'Administrator';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log(`Created admin user: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists: ${adminEmail}`);
    }

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();

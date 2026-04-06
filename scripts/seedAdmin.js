/**
 * Creates a default admin user if one with ADMIN_EMAIL does not exist.
 * Run: npm run seed
 */
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../src/models/User');
const { ROLES } = require('../src/constants/roles');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const name = process.env.ADMIN_NAME || 'System Admin';

  await mongoose.connect(uri);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`User already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await User.hashPassword(password);
  await User.create({
    email,
    passwordHash,
    name,
    role: ROLES.ADMIN,
    isActive: true,
  });

  console.log(`Created admin user: ${email}`);
  console.log('Change the default password after first login.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

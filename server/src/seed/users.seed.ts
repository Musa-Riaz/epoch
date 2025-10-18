import connectDB from './connect';
import User from '../infrastructure/database/models/user.model';
import { hashPassword } from '../app/utils/hash.util';

async function seed() {
  await connectDB();

  // clear existing users (ONLY for local/dev)
  await User.deleteMany({});

  const users = [
    { firstName: 'Alice', lastName: 'Admin', email: 'alice@example.com', password: 'password123', role: 'admin' },
    { firstName: 'Bob', lastName: 'Manager', email: 'bob@example.com', password: 'password123', role: 'manager' },
    { firstName: 'Carol', lastName: 'Member', email: 'carol@example.com', password: 'password123', role: 'member' },
    { firstName: 'David', lastName: 'Member', email: 'david@example.com', password: 'password123', role: 'member' },
    { firstName: 'Eve', lastName: 'Member', email: 'eve@example.com', password: 'password123', role: 'member' },
    { firstName: 'Frank', lastName: 'Member', email: 'frank@example.com', password: 'password123', role: 'member' },
    { firstName: 'Grace', lastName: 'Member', email: 'grace@example.com', password: 'password123', role: 'member' },
    { firstName: 'Hank', lastName: 'Member', email: 'hank@example.com', password: 'password123', role: 'member' },
    { firstName: 'Ivy', lastName: 'Member', email: 'ivy@example.com', password: 'password123', role: 'member' }
  ];

  for (const u of users) {
    const hashed = await hashPassword(u.password);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await User.create({ ...(u as any), password: hashed });
  }

  console.log('Seeded users');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

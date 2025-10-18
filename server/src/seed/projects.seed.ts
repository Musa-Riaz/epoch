import connectDB from './connect';
import Project from '../infrastructure/database/models/project.model';
import User from '../infrastructure/database/models/user.model';

async function seed() {
  await connectDB();

  await Project.deleteMany({});

  const users = await User.find().limit(3);
  if (users.length === 0) {
    console.error('No users found — run users seed first');
    process.exit(1);
  }

  const projects = [
    { name: 'Project Apollo', description: 'Landing on the moon', owner: users[0]._id, team: users.map(u => u._id) },
    { name: 'Project Hermes', description: 'Fast messaging', owner: users[1]._id, team: users.map(u => u._id) },
    { name: 'Project Zeus', description: 'Cloud computing', owner: users[2]._id, team: users.map(u => u._id) },
    { name: 'Project Athena', description: 'AI development', owner: users[0]._id, team: users.map(u => u._id) },
    { name: 'Project Poseidon', description: 'Ocean exploration', owner: users[1]._id, team: users.map(u => u._id) },
    { name: 'Project Ares', description: 'Defense systems', owner: users[2]._id, team: users.map(u => u._id) },
    { name: 'Project Demeter', description: 'Agricultural tech', owner: users[0]._id, team: users.map(u => u._id) },
    { name: 'Project Hestia', description: 'Smart home solutions', owner: users[1]._id, team: users.map(u => u._id) },
    { name: 'Project Apollo II', description: 'Mars colonization', owner: users[2]._id, team: users.map(u => u._id) },
    { name: 'Project Nike', description: 'Sports analytics', owner: users[0]._id, team: users.map(u => u._id) },
    { name: 'Project Helios', description: 'Solar energy', owner: users[1]._id, team: users.map(u => u._id) },
    { name: 'Project Selene', description: 'Lunar research', owner: users[2]._id, team: users.map(u => u._id) },
    { name: 'Project Chronos', description: 'Time management', owner: users[0]._id, team: users.map(u => u._id) },
    { name: 'Project Eros', description: 'Social networking', owner: users[1]._id, team: users.map(u => u._id) },
    { name: 'Project Gaia', description: 'Environmental monitoring', owner: users[2]._id, team: users.map(u => u._id) },
  ];

  for (const p of projects) await Project.create(p as any);

  console.log('Seeded projects');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

import connectDB from './connect';
import Task from '../infrastructure/database/models/task.model';
import Project from '../infrastructure/database/models/project.model';
import User from '../infrastructure/database/models/user.model';

async function seed() {
  await connectDB();

  await Task.deleteMany({});

  const projects = await Project.find().limit(2);
  const users = await User.find().limit(3);

  if (projects.length === 0 || users.length === 0) {
    console.error('No projects or users found — run previous seeds first');
    process.exit(1);
  }

  const tasks = [
    { title: 'Design module', projectId: projects[0]._id, assignedTo: users[2]._id, priority: 'high' },
    { title: 'Implement API', projectId: projects[0]._id, assignedTo: users[1]._id, priority: 'medium' },
    { title: 'Write tests', projectId: projects[1]._id, assignedTo: users[2]._id, priority: 'low' },
    { title: 'Deploy to staging', projectId: projects[1]._id, assignedTo: users[0]._id, priority: 'high' },
    { title: 'Code review', projectId: projects[0]._id, assignedTo: users[0]._id, priority: 'medium' },
    { title: 'Update documentation', projectId: projects[1]._id, assignedTo: users[1]._id, priority: 'low' },
    { title: 'Finalize release', projectId: projects[0]._id, assignedTo: users[1]._id, priority: 'high' },
    { title: 'Client feedback', projectId: projects[1]._id, assignedTo: users[2]._id, priority: 'medium' },
    { title: 'Bug fixes', projectId: projects[0]._id, assignedTo: users[0]._id, priority: 'low' },
    { title: 'Performance optimization', projectId: projects[1]._id, assignedTo: users[1]._id, priority: 'high' },
    { title: 'UI enhancements', projectId: projects[0]._id, assignedTo: users[2]._id, priority: 'medium' },
    { title: 'Database migration', projectId: projects[1]._id, assignedTo: users[0]._id, priority: 'high' },
  ];

  for (const t of tasks) await Task.create(t as any);

  console.log('Seeded tasks');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

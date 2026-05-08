const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskflow.dev' },
    update: {},
    create: { email: 'admin@taskflow.dev', name: 'Alex Admin', password }
  });
  const member = await prisma.user.upsert({
    where: { email: 'member@taskflow.dev' },
    update: {},
    create: { email: 'member@taskflow.dev', name: 'Morgan Member', password }
  });
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign', description: 'Complete overhaul of company website',
      ownerId: admin.id,
      members: { create: [{ userId: admin.id, role: 'ADMIN' }, { userId: member.id, role: 'MEMBER' }] }
    }
  });
  const tasks = [
    { title: 'Design homepage wireframes', status: 'DONE', priority: 'HIGH', assigneeId: member.id, creatorId: admin.id },
    { title: 'Set up CI/CD pipeline', status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: admin.id, creatorId: admin.id },
    { title: 'Write API documentation', status: 'TODO', priority: 'MEDIUM', assigneeId: member.id, creatorId: admin.id, dueDate: new Date(Date.now() - 86400000) },
    { title: 'Implement auth module', status: 'DONE', priority: 'HIGH', assigneeId: admin.id, creatorId: admin.id },
    { title: 'User testing session', status: 'TODO', priority: 'LOW', assigneeId: member.id, creatorId: member.id },
  ];
  for (const t of tasks) await prisma.task.create({ data: { ...t, projectId: project.id } });
  console.log('Seed done. admin@taskflow.dev / password123');
}
main().catch(console.error).finally(() => prisma.$disconnect());

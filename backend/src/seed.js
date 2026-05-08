const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Idempotent — safe to re-run
  const existing = await prisma.user.findUnique({ where: { email: 'admin@taskflow.dev' } })
  if (existing) {
    console.log('✅ Seed already applied — skipping')
    return
  }

  const password = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: { email: 'admin@taskflow.dev', name: 'Alex Admin', password }
  })

  const member = await prisma.user.create({
    data: { email: 'member@taskflow.dev', name: 'Morgan Member', password }
  })

  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with new branding and improved UX.',
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member.id, role: 'MEMBER' }
        ]
      }
    }
  })

  const tasks = [
    {
      title: 'Design new homepage wireframes',
      description: 'Create low and high-fidelity wireframes for the new homepage layout.',
      status: 'DONE', priority: 'HIGH',
      assigneeId: member.id, creatorId: admin.id
    },
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and Railway deployment.',
      status: 'IN_PROGRESS', priority: 'HIGH',
      assigneeId: admin.id, creatorId: admin.id
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints using Markdown.',
      status: 'TODO', priority: 'MEDIUM',
      assigneeId: member.id, creatorId: admin.id,
      dueDate: new Date(Date.now() - 2 * 86400000) // 2 days overdue
    },
    {
      title: 'Implement authentication module',
      status: 'DONE', priority: 'HIGH',
      assigneeId: admin.id, creatorId: admin.id
    },
    {
      title: 'Conduct user testing session',
      description: 'Arrange 5 participants for usability testing of the new flows.',
      status: 'TODO', priority: 'LOW',
      assigneeId: member.id, creatorId: member.id,
      dueDate: new Date(Date.now() + 5 * 86400000) // due in 5 days
    },
    {
      title: 'Optimize image assets',
      status: 'TODO', priority: 'LOW',
      assigneeId: null, creatorId: admin.id
    }
  ]

  for (const t of tasks) {
    await prisma.task.create({ data: { ...t, projectId: project.id } })
  }

  console.log('✅ Seed complete!')
  console.log('   Admin  → admin@taskflow.dev  / password123')
  console.log('   Member → member@taskflow.dev / password123')
}

main()
  .catch(err => { console.error('Seed failed:', err); process.exit(1) })
  .finally(() => prisma.$disconnect())
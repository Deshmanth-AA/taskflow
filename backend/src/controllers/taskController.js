const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  creator: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } }
};

const getProjectTasks = async (req, res, next) => {
  try {
    const { status, priority, assigneeId } = req.query;
    const where = { projectId: req.params.projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (err) { next(err); }
};

const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: req.user.id },
      include: taskInclude,
      orderBy: { dueDate: 'asc' }
    });
    res.json(tasks);
  } catch (err) { next(err); }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const projectIds = (await prisma.projectMember.findMany({
      where: { userId }, select: { projectId: true }
    })).map(m => m.projectId);

    const [total, todo, inProgress, done, overdue, myTasks, projects] = await Promise.all([
      prisma.task.count({ where: { projectId: { in: projectIds } } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: { not: 'DONE' }, dueDate: { lt: now } } }),
      prisma.task.findMany({
        where: { assigneeId: userId, status: { not: 'DONE' } },
        include: taskInclude,
        orderBy: { dueDate: 'asc' },
        take: 5
      }),
      prisma.project.count({ where: { members: { some: { userId } } } })
    ]);

    res.json({ total, todo, inProgress, done, overdue, myTasks, projects });
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const { projectId } = req.params;

    if (assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId } }
      });
      if (!isMember) return res.status(400).json({ error: 'Assignee is not a project member' });
    }

    const task = await prisma.task.create({
      data: {
        title, description, status, priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId, assigneeId: assigneeId || null,
        creatorId: req.user.id
      },
      include: taskInclude
    });
    res.status(201).json(task);
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Members can update status of their own tasks; admins can update anything
    const isAdmin = req.membership?.role === 'ADMIN';
    const isAssignee = task.assigneeId === req.user.id;
    const isCreator = task.creatorId === req.user.id;

    if (!isAdmin && !isAssignee && !isCreator) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null })
      },
      include: taskInclude
    });
    res.json(updated);
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};

module.exports = { getProjectTasks, getMyTasks, getDashboardStats, createTask, updateTask, deleteTask };

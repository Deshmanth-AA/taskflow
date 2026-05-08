const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user.id } } },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (err) { next(err); }
};

const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
};

const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: {
        name, description,
        ownerId: req.user.id,
        members: { create: { userId: req.user.id, role: 'ADMIN' } }
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } }
      }
    });
    res.status(201).json(project);
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } }
      }
    });
    res.json(project);
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};

const addMember = async (req, res, next) => {
  try {
    const { email, role = 'MEMBER' } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: req.params.id } }
    });
    if (existing) return res.status(409).json({ error: 'User already a member' });

    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId: req.params.id, role },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.status(201).json(member);
  } catch (err) { next(err); }
};

const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const member = await prisma.projectMember.findFirst({
      where: { userId: memberId, projectId: req.params.id }
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    if (member.userId === req.user.id) return res.status(400).json({ error: 'Cannot remove yourself' });

    await prisma.projectMember.delete({ where: { id: member.id } });
    res.json({ message: 'Member removed' });
  } catch (err) { next(err); }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'MEMBER'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const member = await prisma.projectMember.findFirst({
      where: { userId: memberId, projectId: req.params.id }
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const updated = await prisma.projectMember.update({
      where: { id: member.id },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.json(updated);
  } catch (err) { next(err); }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember, updateMemberRole };

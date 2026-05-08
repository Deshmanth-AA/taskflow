const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } }
        ],
        NOT: { id: req.user.id }
      },
      select: { id: true, name: true, email: true },
      take: 10
    });
    res.json(users);
  } catch (err) { next(err); }
});

module.exports = router;

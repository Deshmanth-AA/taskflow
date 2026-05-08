const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, requireProjectAdmin, requireProjectMember } = require('../middleware/auth');
const {
  getProjects, getProject, createProject, updateProject, deleteProject,
  addMember, removeMember, updateMemberRole
} = require('../controllers/projectController');

router.use(authenticate);

router.get('/', getProjects);
router.post('/', [body('name').trim().notEmpty()], createProject);
router.get('/:id', requireProjectMember, getProject);
router.put('/:id', requireProjectAdmin, updateProject);
router.delete('/:id', requireProjectAdmin, deleteProject);

// Member management (admin only)
router.post('/:id/members', requireProjectAdmin, addMember);
router.delete('/:id/members/:memberId', requireProjectAdmin, removeMember);
router.patch('/:id/members/:memberId/role', requireProjectAdmin, updateMemberRole);

module.exports = router;

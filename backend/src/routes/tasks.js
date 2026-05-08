const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, requireProjectMember, requireProjectAdmin } = require('../middleware/auth');
const {
  getProjectTasks, getMyTasks, getDashboardStats,
  createTask, updateTask, deleteTask
} = require('../controllers/taskController');

router.use(authenticate);

router.get('/my', getMyTasks);
router.get('/dashboard', getDashboardStats);

router.get('/project/:projectId', requireProjectMember, getProjectTasks);
router.post('/project/:projectId', requireProjectMember, [
  body('title').trim().notEmpty()
], createTask);

router.put('/project/:projectId/:taskId', requireProjectMember, updateTask);
router.delete('/project/:projectId/:taskId', requireProjectAdmin, deleteTask);

module.exports = router;

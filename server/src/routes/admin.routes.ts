import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  departmentController, categoryController, userController,
  slaController, analyticsController, notificationController,
} from '../controllers/admin.controller';
import {
  createDepartmentSchema, updateDepartmentSchema,
  createCategorySchema, updateCategorySchema,
  updateUserSchema, updateSlaRuleSchema,
} from '../types/schemas';

const router = Router();
router.use(authenticate);

// --- Departments ---
router.get('/departments', (req, res) => departmentController.findAll(req, res));
router.get('/departments/:id', (req, res) => departmentController.findById(req, res));
router.post('/departments', requireRole('ADMIN'), validate(createDepartmentSchema), (req, res) => departmentController.create(req, res));
router.patch('/departments/:id', requireRole('ADMIN'), validate(updateDepartmentSchema), (req, res) => departmentController.update(req, res));
router.delete('/departments/:id', requireRole('ADMIN'), (req, res) => departmentController.delete(req, res));

// --- Categories ---
router.get('/categories', (req, res) => categoryController.findAll(req, res));
router.get('/categories/:id', (req, res) => categoryController.findById(req, res));
router.post('/categories', requireRole('ADMIN'), validate(createCategorySchema), (req, res) => categoryController.create(req, res));
router.patch('/categories/:id', requireRole('ADMIN'), validate(updateCategorySchema), (req, res) => categoryController.update(req, res));
router.delete('/categories/:id', requireRole('ADMIN'), (req, res) => categoryController.delete(req, res));

// --- Users (Admin) ---
router.get('/users', requireRole('ADMIN'), (req, res) => userController.findAll(req, res));
router.get('/users/:id', requireRole('ADMIN'), (req, res) => userController.findById(req, res));
router.patch('/users/:id', requireRole('ADMIN'), validate(updateUserSchema), (req, res) => userController.update(req, res));
router.get('/users/department/:departmentId', requireRole('ADMIN', 'STAFF'), (req, res) => userController.getStaffByDepartment(req, res));

// --- SLA Rules ---
router.get('/sla-rules', requireRole('ADMIN'), (req, res) => slaController.findAll(req, res));
router.patch('/sla-rules/:id', requireRole('ADMIN'), validate(updateSlaRuleSchema), (req, res) => slaController.update(req, res));

// --- Analytics ---
router.get('/analytics/dashboard', requireRole('ADMIN'), (req, res) => analyticsController.dashboard(req, res));
router.get('/analytics/trends', requireRole('ADMIN'), (req, res) => analyticsController.trends(req, res));
router.get('/analytics/user', (req, res) => analyticsController.userStats(req, res));
router.get('/analytics/staff', requireRole('STAFF'), (req, res) => analyticsController.staffStats(req, res));

// --- Notifications ---
router.get('/notifications', (req, res) => notificationController.findAll(req, res));
router.get('/notifications/unread-count', (req, res) => notificationController.getUnreadCount(req, res));
router.patch('/notifications/:id/read', (req, res) => notificationController.markAsRead(req, res));
router.patch('/notifications/read-all', (req, res) => notificationController.markAllAsRead(req, res));

export default router;

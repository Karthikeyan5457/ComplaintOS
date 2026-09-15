import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { departmentService } from '../services/department.service';
import { categoryService } from '../services/category.service';
import { userService } from '../services/user.service';
import { slaService } from '../services/sla.service';
import { analyticsService } from '../services/analytics.service';
import { notificationService } from '../services/notification.service';
import { param } from '../utils/request';

// Department Controller
export class DepartmentController {
  async findAll(_req: AuthRequest, res: Response) {
    try {
      const departments = await departmentService.findAll();
      res.json(departments);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async findById(req: AuthRequest, res: Response) {
    try {
      const dept = await departmentService.findById(param(req, 'id'));
      res.json(dept);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async create(req: AuthRequest, res: Response) {
    try {
      const dept = await departmentService.create(req.body);
      res.status(201).json(dept);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async update(req: AuthRequest, res: Response) {
    try {
      const dept = await departmentService.update(param(req, 'id'), req.body);
      res.json(dept);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async delete(req: AuthRequest, res: Response) {
    try {
      await departmentService.delete(param(req, 'id'));
      res.json({ message: 'Department deleted' });
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
}

// Category Controller
export class CategoryController {
  async findAll(_req: AuthRequest, res: Response) {
    try {
      const categories = await categoryService.findAll();
      res.json(categories);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async findById(req: AuthRequest, res: Response) {
    try {
      const cat = await categoryService.findById(param(req, 'id'));
      res.json(cat);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async create(req: AuthRequest, res: Response) {
    try {
      const cat = await categoryService.create(req.body);
      res.status(201).json(cat);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async update(req: AuthRequest, res: Response) {
    try {
      const cat = await categoryService.update(param(req, 'id'), req.body);
      res.json(cat);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async delete(req: AuthRequest, res: Response) {
    try {
      await categoryService.delete(param(req, 'id'));
      res.json({ message: 'Category deactivated' });
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
}

// User Controller
export class UserController {
  async findAll(req: AuthRequest, res: Response) {
    try {
      const { page = '1', limit = '10', role, search } = req.query as any;
      const result = await userService.findAll({ page: Number(page), limit: Number(limit), role, search });
      res.json(result);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async findById(req: AuthRequest, res: Response) {
    try {
      const user = await userService.findById(param(req, 'id'));
      res.json(user);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async update(req: AuthRequest, res: Response) {
    try {
      const user = await userService.update(param(req, 'id'), req.body);
      res.json(user);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async delete(req: AuthRequest, res: Response) {
    try {
      await userService.delete(param(req, 'id'));
      res.json({ message: 'User deleted' });
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async getStaffByDepartment(req: AuthRequest, res: Response) {
    try {
      const staff = await userService.getStaffByDepartment(param(req, 'departmentId'));
      res.json(staff);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
}

// SLA Controller
export class SlaController {
  async findAll(_req: AuthRequest, res: Response) {
    try {
      const rules = await slaService.findAll();
      res.json(rules);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async update(req: AuthRequest, res: Response) {
    try {
      const rule = await slaService.update(param(req, 'id'), req.body);
      res.json(rule);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
}

// Analytics Controller
export class AnalyticsController {
  async dashboard(_req: AuthRequest, res: Response) {
    try {
      const stats = await analyticsService.getDashboardStats();
      res.json(stats);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async trends(req: AuthRequest, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const trends = await analyticsService.getTrends(days);
      res.json(trends);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async userStats(req: AuthRequest, res: Response) {
    try {
      const stats = await analyticsService.getUserStats(req.user!.id);
      res.json(stats);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async staffStats(req: AuthRequest, res: Response) {
    try {
      const stats = await analyticsService.getStaffStats(req.user!.id, req.user!.departmentId);
      res.json(stats);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
}

// Notification Controller
export class NotificationController {
  async findAll(req: AuthRequest, res: Response) {
    try {
      const notifications = await notificationService.findByUser(req.user!.id);
      res.json(notifications);
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async markAsRead(req: AuthRequest, res: Response) {
    try {
      await notificationService.markAsRead(param(req, 'id'), req.user!.id);
      res.json({ message: 'Marked as read' });
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      res.json({ message: 'All marked as read' });
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const count = await notificationService.getUnreadCount(req.user!.id);
      res.json({ count });
    } catch (error: any) { res.status(error.statusCode || 500).json({ error: error.message }); }
  }
}

export const departmentController = new DepartmentController();
export const categoryController = new CategoryController();
export const userController = new UserController();
export const slaController = new SlaController();
export const analyticsController = new AnalyticsController();
export const notificationController = new NotificationController();

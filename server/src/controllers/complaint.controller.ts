import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { complaintService } from '../services/complaint.service';
import { complaintQuerySchema } from '../types/schemas';
import { param } from '../utils/request';

export class ComplaintController {
  async create(req: AuthRequest, res: Response) {
    try {
      const complaint = await complaintService.create({
        ...req.body,
        userId: req.user!.id,
      });
      res.status(201).json(complaint);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async findAll(req: AuthRequest, res: Response) {
    try {
      const query = complaintQuerySchema.parse(req.query);
      const params: any = { ...query };

      // Role-based filtering
      if (req.user!.role === 'USER') {
        params.userId = req.user!.id;
      } else if (req.user!.role === 'STAFF') {
        params.departmentId = req.user!.departmentId || undefined;
      }

      const result = await complaintService.findAll(params);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async findById(req: AuthRequest, res: Response) {
    try {
      const complaint = await complaintService.findById(param(req, 'id'));

      if (req.user!.role === 'USER' && complaint.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (req.user!.role === 'USER') {
        complaint.comments = complaint.comments.filter((c: any) => !c.isInternal);
      }

      res.json(complaint);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const complaint = await complaintService.update(param(req, 'id'), req.body, req.user!.id);
      res.json(complaint);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const complaint = await complaintService.updateStatus(
        param(req, 'id'),
        req.body.status,
        req.user!.id,
        req.body.note,
        req.body.resolutionNotes,
      );
      res.json(complaint);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async assign(req: AuthRequest, res: Response) {
    try {
      const complaint = await complaintService.assign(
        param(req, 'id'),
        req.body.assignedToId,
        req.user!.id,
        req.body.note,
      );
      res.json(complaint);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async addComment(req: AuthRequest, res: Response) {
    try {
      const comment = await complaintService.addComment(
        param(req, 'id'),
        req.user!.id,
        req.body.content,
        req.body.isInternal,
      );
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async uploadAttachment(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const { supabase } = await import('../lib/supabase');
      const { data: attachment, error: attachError } = await supabase.from('attachments').insert({
        complaintId: param(req, 'id'),
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
      }).select().single();
      
      if (attachError) throw new Error('Failed to save attachment info');
      
      res.status(201).json(attachment);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await complaintService.delete(param(req, 'id'), req.user!.id, req.user!.role, req.user!.departmentId);
      res.json({ message: 'Complaint deleted successfully' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export const complaintController = new ComplaintController();

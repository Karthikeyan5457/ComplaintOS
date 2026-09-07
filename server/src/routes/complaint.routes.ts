import { Router } from 'express';
import { complaintController } from '../controllers/complaint.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createComplaintSchema, updateComplaintSchema, updateStatusSchema, assignComplaintSchema, createCommentSchema } from '../types/schemas';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(createComplaintSchema), (req, res) => complaintController.create(req, res));
router.get('/', (req, res) => complaintController.findAll(req, res));
router.get('/:id', (req, res) => complaintController.findById(req, res));
router.patch('/:id', requireRole('ADMIN', 'STAFF'), validate(updateComplaintSchema), (req, res) => complaintController.update(req, res));
router.post('/:id/status', requireRole('ADMIN', 'STAFF'), validate(updateStatusSchema), (req, res) => complaintController.updateStatus(req, res));
router.post('/:id/assign', requireRole('ADMIN', 'STAFF'), validate(assignComplaintSchema), (req, res) => complaintController.assign(req, res));
router.post('/:id/comments', validate(createCommentSchema), (req, res) => complaintController.addComment(req, res));
router.post('/:id/attachments', upload.single('file'), (req, res) => complaintController.uploadAttachment(req, res));

export default router;

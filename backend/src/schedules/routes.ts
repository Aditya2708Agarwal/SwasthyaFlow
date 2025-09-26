import { Router, Request } from 'express';
import { body, param, validationResult } from 'express-validator';
import Schedule from './model';
import { getUserId } from '../auth';
import { requireRole } from '../middleware/role';

const router = Router();

// Patient view: schedules where current user is the patient
router.get('/', requireRole('patient'), async (req: Request, res) => {
  try {
    const userId = getUserId(req);
    const items = await Schedule.find({ userId }).sort({ startTime: 1 }).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Doctor view: schedules where current user is the therapist
router.get('/for-doctor', requireRole('doctor'), async (req: Request, res) => {
  try {
    const therapistId = getUserId(req);
    const items = await Schedule.find({ therapistId }).sort({ startTime: 1 }).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctor schedules' });
  }
});

router.post(
  '/',
  body('therapistId').isString().trim().notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('notes').optional().isString(),
  requireRole('patient'),
  async (req: Request, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const userId = getUserId(req);
      const { therapistId, startTime, endTime, notes } = req.body;
      const doc = await Schedule.create({
        userId,
        therapistId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
      });
      res.status(201).json({ item: doc });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  }
);

router.post(
  '/:id/cancel',
  param('id').isMongoId(),
  requireRole('patient'),
  async (req: Request, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const updated = await Schedule.findOneAndUpdate(
        { _id: id, userId },
        { $set: { status: 'cancelled' } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json({ item: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to cancel schedule' });
    }
  }
);

// Doctor completes an appointment (only if they are assigned therapist)
router.post(
  '/:id/complete',
  param('id').isMongoId(),
  requireRole('doctor'),
  async (req: Request, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const therapistId = getUserId(req);
      const { id } = req.params;
      const updated = await Schedule.findOneAndUpdate(
        { _id: id, therapistId },
        { $set: { status: 'completed' } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json({ item: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to complete schedule' });
    }
  }
);

export default router;



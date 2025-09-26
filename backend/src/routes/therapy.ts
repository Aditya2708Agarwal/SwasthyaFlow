import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Schedule from '../schedules/model';
import { z } from 'zod';

const router = Router();

// Auth middleware
const auth = (req: Request, res: Response, next: NextFunction) => {
  // Replace this with your actual auth logic
  (req as any).user = { id: '123', email: 'doctor@example.com', role: 'doctor' };
  next();
};

// Request type with auth user
interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  }
}

// Validation schemas
const createSessionSchema = z.object({
  patientId: z.string(),
  therapyType: z.enum(['Abhyanga', 'Shirodhara', 'Nasya', 'Basti', 'Swedana', 'Panchakarma']),
  startTime: z.string().datetime(),
  duration: z.number().int().min(15).max(180).default(60),
  notes: z.string().optional()
});

// Error handler
const handleError = (error: unknown, res: Response) => {
  console.error('Error:', error);
  if (error instanceof z.ZodError) {
    const zodError = error as z.ZodError;
    return res.status(400).json({ 
      error: zodError.issues.map((e: z.ZodIssue) => ({
        path: e.path.join('.'),
        message: e.message
      })) 
    });
  }
  if (error instanceof Error) {
    const err = error as Error;
    return res.status(500).json({ 
      error: err.message || 'An unexpected error occurred'
    });
  }
  return res.status(500).json({ error: 'An unexpected error occurred' });
};

// Create a new therapy session
router.post('/schedules', [auth], async (req: Request, res: Response) => {
  try {
    const data = createSessionSchema.parse(req.body);
    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + data.duration * 60000);
    const user = (req as AuthRequest).user;

    const session = new Schedule({
      patientId: data.patientId,
      doctorId: user.id,
      therapyType: data.therapyType,
      startTime,
      endTime,
      notes: data.notes
    });
    
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    handleError(error, res);
  }
});

// Get all sessions for a doctor with date filter
router.get('/schedules/for-doctor', [auth], async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const user = (req as AuthRequest).user;
    const query: any = { doctorId: user.id };
    
    if (date && typeof date === 'string') {
      const searchDate = parseISO(date);
      query.startTime = {
        $gte: startOfDay(searchDate),
        $lte: endOfDay(searchDate)
      };
    }

    const sessions = await Schedule.find(query).sort({ startTime: 1 });
    res.json({ items: sessions });
  } catch (error) {
    handleError(error, res);
  }
});

// Get all sessions for a patient
router.get('/schedules/for-patient', [auth], async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const user = (req as AuthRequest).user;
    const query: any = { patientId: user.id };
    
    if (date && typeof date === 'string') {
      const searchDate = parseISO(date);
      query.startTime = {
        $gte: startOfDay(searchDate),
        $lte: endOfDay(searchDate)
      };
    }

    const sessions = await Schedule.find(query).sort({ startTime: 1 });
    res.json({ items: sessions });
  } catch (error) {
    handleError(error, res);
  }
});

// Update a session status
router.post('/schedules/:id/:action', [auth], async (req: Request, res: Response) => {
  try {
    const { id, action } = req.params;
    const user = (req as AuthRequest).user;
    const validActions = ['complete', 'cancel'] as const;
    
    if (!validActions.includes(action as typeof validActions[number])) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const status = action === 'complete' ? 'completed' : 'cancelled';
    const session = await Schedule.findOneAndUpdate(
      { _id: id, doctorId: user.id },
      { status },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
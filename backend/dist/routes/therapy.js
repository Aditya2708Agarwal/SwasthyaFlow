"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const date_fns_1 = require("date-fns");
const model_1 = __importDefault(require("../schedules/model"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Auth middleware
const auth = (req, res, next) => {
    // Replace this with your actual auth logic
    req.user = { id: '123', email: 'doctor@example.com', role: 'doctor' };
    next();
};
// Validation schemas
const createSessionSchema = zod_1.z.object({
    patientId: zod_1.z.string(),
    therapyType: zod_1.z.enum(['Abhyanga', 'Shirodhara', 'Nasya', 'Basti', 'Swedana', 'Panchakarma']),
    startTime: zod_1.z.string().datetime(),
    duration: zod_1.z.number().int().min(15).max(180).default(60),
    notes: zod_1.z.string().optional()
});
// Error handler
const handleError = (error, res) => {
    console.error('Error:', error);
    if (error instanceof zod_1.z.ZodError) {
        const zodError = error;
        return res.status(400).json({
            error: zodError.issues.map((e) => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
    }
    if (error instanceof Error) {
        const err = error;
        return res.status(500).json({
            error: err.message || 'An unexpected error occurred'
        });
    }
    return res.status(500).json({ error: 'An unexpected error occurred' });
};
// Create a new therapy session
router.post('/schedules', [auth], async (req, res) => {
    try {
        const data = createSessionSchema.parse(req.body);
        const startTime = new Date(data.startTime);
        const endTime = new Date(startTime.getTime() + data.duration * 60000);
        const user = req.user;
        const session = new model_1.default({
            patientId: data.patientId,
            doctorId: user.id,
            therapyType: data.therapyType,
            startTime,
            endTime,
            notes: data.notes
        });
        await session.save();
        res.status(201).json(session);
    }
    catch (error) {
        handleError(error, res);
    }
});
// Get all sessions for a doctor with date filter
router.get('/schedules/for-doctor', [auth], async (req, res) => {
    try {
        const { date } = req.query;
        const user = req.user;
        const query = { doctorId: user.id };
        if (date && typeof date === 'string') {
            const searchDate = (0, date_fns_1.parseISO)(date);
            query.startTime = {
                $gte: (0, date_fns_1.startOfDay)(searchDate),
                $lte: (0, date_fns_1.endOfDay)(searchDate)
            };
        }
        const sessions = await model_1.default.find(query).sort({ startTime: 1 });
        res.json({ items: sessions });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Get all sessions for a patient
router.get('/schedules/for-patient', [auth], async (req, res) => {
    try {
        const { date } = req.query;
        const user = req.user;
        const query = { patientId: user.id };
        if (date && typeof date === 'string') {
            const searchDate = (0, date_fns_1.parseISO)(date);
            query.startTime = {
                $gte: (0, date_fns_1.startOfDay)(searchDate),
                $lte: (0, date_fns_1.endOfDay)(searchDate)
            };
        }
        const sessions = await model_1.default.find(query).sort({ startTime: 1 });
        res.json({ items: sessions });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Update a session status
router.post('/schedules/:id/:action', [auth], async (req, res) => {
    try {
        const { id, action } = req.params;
        const user = req.user;
        const validActions = ['complete', 'cancel'];
        if (!validActions.includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }
        const status = action === 'complete' ? 'completed' : 'cancelled';
        const session = await model_1.default.findOneAndUpdate({ _id: id, doctorId: user.id }, { status }, { new: true });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const model_1 = __importDefault(require("./model"));
const auth_1 = require("../auth");
const role_1 = require("../middleware/role");
const router = (0, express_1.Router)();
// Patient view: schedules where current user is the patient
router.get('/', (0, role_1.requireRole)('patient'), async (req, res) => {
    try {
        const userId = (0, auth_1.getUserId)(req);
        const items = await model_1.default.find({ userId }).sort({ startTime: 1 }).lean();
        res.json({ items });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});
// Doctor view: schedules where current user is the therapist
router.get('/for-doctor', (0, role_1.requireRole)('doctor'), async (req, res) => {
    try {
        const therapistId = (0, auth_1.getUserId)(req);
        const items = await model_1.default.find({ therapistId }).sort({ startTime: 1 }).lean();
        res.json({ items });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch doctor schedules' });
    }
});
router.post('/', (0, express_validator_1.body)('therapistId').isString().trim().notEmpty(), (0, express_validator_1.body)('startTime').isISO8601(), (0, express_validator_1.body)('endTime').isISO8601(), (0, express_validator_1.body)('notes').optional().isString(), (0, role_1.requireRole)('patient'), async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    try {
        const userId = (0, auth_1.getUserId)(req);
        const { therapistId, startTime, endTime, notes } = req.body;
        const doc = await model_1.default.create({
            userId,
            therapistId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            notes,
        });
        res.status(201).json({ item: doc });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});
router.post('/:id/cancel', (0, express_validator_1.param)('id').isMongoId(), (0, role_1.requireRole)('patient'), async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    try {
        const userId = (0, auth_1.getUserId)(req);
        const { id } = req.params;
        const updated = await model_1.default.findOneAndUpdate({ _id: id, userId }, { $set: { status: 'cancelled' } }, { new: true });
        if (!updated)
            return res.status(404).json({ error: 'Not found' });
        res.json({ item: updated });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to cancel schedule' });
    }
});
// Doctor completes an appointment (only if they are assigned therapist)
router.post('/:id/complete', (0, express_validator_1.param)('id').isMongoId(), (0, role_1.requireRole)('doctor'), async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    try {
        const therapistId = (0, auth_1.getUserId)(req);
        const { id } = req.params;
        const updated = await model_1.default.findOneAndUpdate({ _id: id, therapistId }, { $set: { status: 'completed' } }, { new: true });
        if (!updated)
            return res.status(404).json({ error: 'Not found' });
        res.json({ item: updated });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to complete schedule' });
    }
});
exports.default = router;

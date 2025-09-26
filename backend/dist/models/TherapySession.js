"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TherapySession = void 0;
const mongoose_1 = require("mongoose");
const TherapySessionSchema = new mongoose_1.Schema({
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    therapyType: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true, default: 60 }, // in minutes
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: { type: String, default: '' },
    followUp: { type: Date },
    progress: { type: Number, min: 0, max: 100 }
}, {
    timestamps: true
});
exports.TherapySession = (0, mongoose_1.model)('TherapySession', TherapySessionSchema);

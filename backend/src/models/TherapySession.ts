import { Schema, model } from 'mongoose';

interface ITherapySession {
  patientId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  therapyType: string;
  date: Date;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  followUp?: Date;
  progress?: number;
}

const TherapySessionSchema = new Schema<ITherapySession>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

export const TherapySession = model<ITherapySession>('TherapySession', TherapySessionSchema);
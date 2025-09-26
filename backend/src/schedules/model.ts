 import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ScheduleDocument extends Document {
  patientId: string; // Clerk user id
  doctorId: string;
  startTime: Date;
  endTime: Date;
  therapyType: string;
  notes?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ScheduleDocument>(
  {
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    therapyType: { 
      type: String, 
      required: true,
      enum: ['Abhyanga', 'Shirodhara', 'Nasya', 'Basti', 'Swedana', 'Panchakarma']
    },
    notes: { type: String },
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled',
      index: true,
    },
  },
  { timestamps: true }
);

const Schedule: Model<ScheduleDocument> =
  mongoose.models.Schedule || mongoose.model<ScheduleDocument>('Schedule', scheduleSchema);

export default Schedule;



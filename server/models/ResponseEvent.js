import mongoose from 'mongoose';

const responseEventSchema = new mongoose.Schema(
  {
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      required: [true, 'Incident reference is required'],
      index: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResponseUnit',
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['REPORTED', 'DISPATCHED', 'ARRIVED', 'RESOLVED'],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
    actor: {
      type: String,
      default: 'Dispatcher Control Room',
    },
  },
  {
    timestamps: true,
  }
);

export const ResponseEvent = mongoose.model('ResponseEvent', responseEventSchema);

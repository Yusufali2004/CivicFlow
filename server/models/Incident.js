import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    incidentNumber: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'Accident',
        'Traffic Jam',
        'Road Blockage',
        'Signal Failure',
        'Fire',
        'Medical Emergency',
      ],
    },
    severity: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      required: true,
      enum: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'],
      default: 'REPORTED',
      index: true,
    },
    area: {
      type: String,
      required: true,
      enum: [
        'Whitefield',
        'Koramangala',
        'Indiranagar',
        'Hebbal',
        'Yelahanka',
        'HSR Layout',
        'BTM Layout',
        'Marathahalli',
      ],
      index: true,
    },
    locationDetails: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    assignedUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResponseUnit',
      default: null,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    responseNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate human-readable incident number like INC-1024
incidentSchema.pre('save', async function (next) {
  if (!this.incidentNumber) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.incidentNumber = `INC-${Date.now().toString().slice(-4)}${randomSuffix.toString().slice(-2)}`;
  }
  next();
});

export const Incident = mongoose.model('Incident', incidentSchema);

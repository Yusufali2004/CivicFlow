import mongoose from 'mongoose';

const responseUnitSchema = new mongoose.Schema(
  {
    unitCode: {
      type: String,
      required: [true, 'Unit code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Ambulance', 'Police', 'Fire Truck', 'Traffic Unit'],
    },
    status: {
      type: String,
      required: true,
      enum: ['AVAILABLE', 'DISPATCHED', 'BUSY'],
      default: 'AVAILABLE',
      index: true,
    },
    stationArea: {
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
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    contactNumber: {
      type: String,
      default: '',
    },
    currentIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ResponseUnit = mongoose.model('ResponseUnit', responseUnitSchema);

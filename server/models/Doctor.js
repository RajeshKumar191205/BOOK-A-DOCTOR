import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullname: {
    type: String,
    required: true,
    set: (val) => val.charAt(0).toUpperCase() + val.slice(1)
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  fees: { type: Number, required: true },
  timings: { type: String, required: true }, // e.g., "11:00 - 14:00"
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, {
  timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;

import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The Patient
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Doctor Profile
  doctorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Doctor's User Account
  date: { type: String, required: true },
  time: { type: String, required: true },
  document: { type: String, required: true }, // File name or URL
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;

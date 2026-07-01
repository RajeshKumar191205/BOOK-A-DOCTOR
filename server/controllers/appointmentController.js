import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Private
export const bookAppointment = async (req, res) => {
  const { doctorId, date, time } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a medical document / report' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      doctorId: doctor._id,
      doctorUserId: doctor.userId,
      date,
      time,
      document: req.file.filename,
      status: 'pending'
    });

    // Push notification to the doctor's user account
    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser) {
      doctorUser.notification.push({
        type: 'new-appointment-request',
        message: `New appointment request from ${req.user.name} on ${date} at ${time}`,
        data: { appointmentId: appointment._id, doctorName: doctor.name },
        onClickPath: '/doctor-appointments'
      });
      await doctorUser.save();
    }

    res.status(201).json({ message: 'Appointment booked successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's appointments (Patient)
// @route   GET /api/appointments/user
// @access  Private
export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate('doctorId')
      .sort({ createdAt: -1 });

    // Add doctorName (fullname) from the doctor profile into each response
    const enriched = appointments.map(app => {
      const obj = app.toObject();
      obj.doctorName = app.doctorId?.fullname || app.doctorId?.name || 'Doctor';
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor's incoming appointments
// @route   GET /api/appointments/doctor
// @access  Private/Doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorUserId: req.user._id })
      .populate('userId', 'name email phone')
      .populate('doctorId')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all appointments (Admin only)
// @route   GET /api/appointments/all
// @access  Private/Admin
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('userId', 'name email phone')
      .populate('doctorId')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status — handleStatusController
// @route   PUT /api/appointments/:id/status
// @access  Private/Doctor
export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify this doctor owns the appointment
    if (appointment.doctorUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    // Push notification to the patient user
    const patientUser = await User.findById(appointment.userId);
    if (patientUser) {
      patientUser.notification.push({
        type: 'appointment-status-update',
        message: `Your appointment on ${appointment.date} at ${appointment.time} has been ${status}`,
        data: { appointmentId: appointment._id },
        onClickPath: '/appointments'
      });
      await patientUser.save();
    }

    res.json({ message: `Appointment ${status} successfully`, data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download a document for a specific appointment
// @route   GET /api/appointments/download/:appointmentId
// @access  Private
export const documentDownloadController = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment || !appointment.document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const filePath = `uploads/${appointment.document}`;
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

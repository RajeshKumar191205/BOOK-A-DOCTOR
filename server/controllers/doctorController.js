import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Apply as a Doctor
// @route   POST /api/doctors/apply
// @access  Private
export const applyAsDoctor = async (req, res) => {
  const { name, email, phone, address, specialization, experience, fees, timings } = req.body;

  try {
    // Check if user has already applied and is pending or approved
    const existingApplication = await Doctor.findOne({ userId: req.user._id });
    if (existingApplication && existingApplication.status === 'approved') {
      return res.status(400).json({ message: 'You are already an approved doctor' });
    }
    if (existingApplication && existingApplication.status === 'pending') {
      return res.status(400).json({ message: 'Your application is already pending review' });
    }

    // Create or update doctor application
    let doctorApp;
    if (existingApplication) {
      existingApplication.fullname = name;
      existingApplication.name = name;
      existingApplication.email = email;
      existingApplication.phone = phone;
      existingApplication.address = address;
      existingApplication.specialization = specialization;
      existingApplication.experience = experience;
      existingApplication.fees = fees;
      existingApplication.timings = timings;
      existingApplication.status = 'pending';
      doctorApp = await existingApplication.save();
    } else {
      doctorApp = await Doctor.create({
        userId: req.user._id,
        fullname: name,
        name,
        email,
        phone,
        address,
        specialization,
        experience,
        fees,
        timings,
        status: 'pending'
      });
    }

    // Send notification to all admin users
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      admin.notification.push({
        type: 'new-doctor-request',
        message: `${name} has applied for a doctor account`,
        data: { doctorId: doctorApp._id, name },
        onClickPath: '/admin-doctors'
      });
      await admin.save();
    }

    res.status(201).json({ message: 'Doctor application submitted successfully', data: doctorApp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all approved doctors
// @route   GET /api/doctors
// @access  Public (or Private)
export const getApprovedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'approved' });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all doctor applications (Admin only)
// @route   GET /api/doctors/all
// @access  Private/Admin
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve doctor (Admin only) — getStatusApproveController
// @route   PUT /api/doctors/:id/status
// @access  Private/Admin
export const updateDoctorStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor application not found' });
    }

    doctor.status = status;
    await doctor.save();

    // Update User role and isDoctor flag
    const user = await User.findById(doctor.userId);
    if (user) {
      if (status === 'approved') {
        user.role = 'doctor';
        user.isDoctor = true;
      } else {
        user.role = 'user';
        user.isDoctor = false;
      }

      // Push notification to the doctor/user about their application status
      user.notification.push({
        type: 'doctor-application-status',
        message: `Your doctor registration has been ${status}`,
        onClickPath: '/notifications'
      });

      await user.save();
    }

    res.json({ message: `Doctor application ${status} successfully`, data: doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private/Doctor
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.json({ message: 'Successfully updated profile', data: doctor });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', success: false });
  }
};

// @desc    Get logged in user's doctor application status
// @route   GET /api/doctors/my-application
// @access  Private
export const getMyApplicationStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'No application found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

let mongod = null;

const seedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Seeding default data...');
      
      // 1. Create Admin User
      const adminUser = await User.create({
        name: 'Hi_Admin',
        email: 'admin@gmail.com',
        password: '123',
        phone: '0987654321',
        role: 'admin',
        isDoctor: false
      });

      // 2. Create Patient User
      const patientUser = await User.create({
        name: 'User',
        email: 'patient@gmail.com',
        password: '123',
        phone: '1234567890',
        role: 'user',
        isDoctor: false
      });

      // 3. Create a second Patient
      const patientUser2 = await User.create({
        name: 'Anjali',
        email: 'anjali@gmail.com',
        password: '123',
        phone: '9123456780',
        role: 'user',
        isDoctor: false
      });

      // 4. Create a third Patient
      const patientUser3 = await User.create({
        name: 'Ravi',
        email: 'ravi@gmail.com',
        password: '123',
        phone: '8012345678',
        role: 'user',
        isDoctor: false
      });

      // 5. Create Doctor User
      const doctorUser = await User.create({
        name: 'Dr. Kaushik',
        email: 'doctor@gmail.com',
        password: '123',
        phone: '9876543210',
        role: 'doctor',
        isDoctor: true
      });

      // 6. Create second Doctor User (Approved)
      const doctorUser3 = await User.create({
        name: 'Dr. Priya',
        email: 'priya@gmail.com',
        password: '123',
        phone: '9988776655',
        role: 'doctor',
        isDoctor: true
      });

      // 7. Create Doctor Profile (Approved) - Dr. Kaushik
      const doctorProfile = await Doctor.create({
        userId: doctorUser._id,
        fullname: 'Kaushik',
        name: doctorUser.name,
        email: doctorUser.email,
        phone: doctorUser.phone,
        address: 'Chennai',
        specialization: 'Blood',
        experience: '10 yrs',
        fees: 1000,
        timings: '11:00 - 14:00',
        status: 'approved'
      });

      // 8. Create Doctor Profile (Approved) - Dr. Priya
      const doctorProfile3 = await Doctor.create({
        userId: doctorUser3._id,
        fullname: 'Priya',
        name: doctorUser3.name,
        email: doctorUser3.email,
        phone: doctorUser3.phone,
        address: 'Hyderabad',
        specialization: 'Neurology',
        experience: '7 yrs',
        fees: 1200,
        timings: '09:00 - 12:00',
        status: 'approved'
      });

      // 9. Create Doctor User (Pending Approval)
      const doctorUser2 = await User.create({
        name: 'Dr. Karthik',
        email: 'karthik@gmail.com',
        password: '123',
        phone: '0987654322',
        role: 'user',
        isDoctor: false
      });

      // 10. Create Doctor Profile (Pending)
      await Doctor.create({
        userId: doctorUser2._id,
        fullname: 'Karthik',
        name: doctorUser2.name,
        email: doctorUser2.email,
        phone: doctorUser2.phone,
        address: 'Bangalore',
        specialization: 'Skin',
        experience: '5 yrs',
        fees: 800,
        timings: '16:00 - 19:00',
        status: 'pending'
      });

      // ─── SEED APPOINTMENTS ─────────────────────────────────────────────────

      // Appointment 1 - Approved
      await Appointment.create({
        userId: patientUser._id,
        doctorId: doctorProfile._id,
        doctorUserId: doctorUser._id,
        date: '2026-07-01',
        time: '11:00',
        document: 'sample_report.pdf',
        status: 'approved'
      });

      // Appointment 2 - Pending
      await Appointment.create({
        userId: patientUser._id,
        doctorId: doctorProfile._id,
        doctorUserId: doctorUser._id,
        date: '2026-07-05',
        time: '13:00',
        document: 'blood_test.pdf',
        status: 'pending'
      });

      // Appointment 3 - Rejected
      await Appointment.create({
        userId: patientUser._id,
        doctorId: doctorProfile3._id,
        doctorUserId: doctorUser3._id,
        date: '2026-06-28',
        time: '10:00',
        document: 'mri_scan.pdf',
        status: 'rejected'
      });

      // Appointment 4 - Approved (Anjali)
      await Appointment.create({
        userId: patientUser2._id,
        doctorId: doctorProfile._id,
        doctorUserId: doctorUser._id,
        date: '2026-07-03',
        time: '12:30',
        document: 'cbc_report.pdf',
        status: 'approved'
      });

      // Appointment 5 - Pending (Anjali)
      await Appointment.create({
        userId: patientUser2._id,
        doctorId: doctorProfile3._id,
        doctorUserId: doctorUser3._id,
        date: '2026-07-08',
        time: '09:30',
        document: 'eeg_report.pdf',
        status: 'pending'
      });

      // Appointment 6 - Approved (Ravi)
      await Appointment.create({
        userId: patientUser3._id,
        doctorId: doctorProfile3._id,
        doctorUserId: doctorUser3._id,
        date: '2026-07-02',
        time: '11:30',
        document: 'xray.pdf',
        status: 'approved'
      });

      // Appointment 7 - Rejected (Ravi)
      await Appointment.create({
        userId: patientUser3._id,
        doctorId: doctorProfile._id,
        doctorUserId: doctorUser._id,
        date: '2026-06-25',
        time: '13:30',
        document: 'ecg_report.pdf',
        status: 'rejected'
      });

      // ─── SEED NOTIFICATIONS ──────────────────────────────────────────────

      // Notifications for patient user
      patientUser.notification = [
        {
          type: 'appointment-status-update',
          message: 'Your appointment with Dr. Kaushik on 2026-07-01 at 11:00 has been approved',
          onClickPath: '/appointments'
        },
        {
          type: 'appointment-status-update',
          message: 'Your appointment with Dr. Priya on 2026-06-28 at 10:00 has been rejected',
          onClickPath: '/appointments'
        }
      ];
      patientUser.seenNotification = [
        {
          type: 'appointment-status-update',
          message: 'Welcome to MediCareBook! Start by finding a doctor.',
          onClickPath: '/home'
        }
      ];
      await patientUser.save();

      // Notifications for admin
      adminUser.notification = [
        {
          type: 'new-doctor-request',
          message: 'Dr. Karthik has applied for a doctor account',
          data: { name: 'Dr. Karthik' },
          onClickPath: '/admin-doctors'
        }
      ];
      await adminUser.save();

      // Notifications for doctor (Dr. Kaushik)
      doctorUser.notification = [
        {
          type: 'new-appointment-request',
          message: 'New appointment request from User on 2026-07-05 at 13:00',
          onClickPath: '/doctor-appointments'
        },
        {
          type: 'new-appointment-request',
          message: 'New appointment request from Anjali on 2026-07-03 at 12:30',
          onClickPath: '/doctor-appointments'
        }
      ];
      await doctorUser.save();

      console.log('Default data seeded successfully (with appointments & notifications)!');
    }
  } catch (error) {
    console.error('Auto seeding failed:', error);
  }
};

const connectDB = async () => {
  try {
    console.log('Starting MongoDB Memory Server...');
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'book-a-doctor'
      }
    });
    
    const uri = mongod.getUri();
    console.log(`In-Memory MongoDB URI: ${uri}`);
    
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default data if database is empty
    await seedIfEmpty();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
export { mongod };

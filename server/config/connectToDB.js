const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const userSchema = require("../schemas/userModel");
const docSchema = require("../schemas/docModel");
const appointSchema = require("../schemas/appointmentModel");

let mongod = null;

const seedIfEmpty = async () => {
  try {
    const userCount = await userSchema.countDocuments();
    if (userCount === 0) {
      console.log("Database is empty. Seeding default data...");
      
      // 1. Create Admin User
      const adminUser = await userSchema.create({
        name: "Rajesh Kumar",
        email: "rajeshkumarkara05@gmail.com",
        password: "$2a$10$abcdefghijklmnopqrstuvwx", // will be auto-hashed on signup or seeded
        phone: "0987654321",
        isdoctor: false,
        type: "admin",
      });

      // Simple bcrypt helper to seed correct passwords
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("123", salt);

      adminUser.password = hashedPassword;
      await adminUser.save();

      // 2. Create Patient User
      const patientUser = await userSchema.create({
        name: "User",
        email: "patient@gmail.com",
        password: hashedPassword,
        phone: "1234567890",
        isdoctor: false,
        type: "patient",
      });

      // 3. Create a second Patient
      const patientUser2 = await userSchema.create({
        name: "Anjali",
        email: "anjali@gmail.com",
        password: hashedPassword,
        phone: "9123456780",
        isdoctor: false,
        type: "patient",
      });

      // 4. Create a third Patient
      const patientUser3 = await userSchema.create({
        name: "Ravi",
        email: "ravi@gmail.com",
        password: hashedPassword,
        phone: "8012345678",
        isdoctor: false,
        type: "patient",
      });

      // 5. Create Doctor User
      const doctorUser = await userSchema.create({
        name: "Dr. Kaushik",
        email: "doctor@gmail.com",
        password: hashedPassword,
        phone: "9876543210",
        isdoctor: true,
        type: "doctor",
      });

      // 6. Create second Doctor User (Approved)
      const doctorUser3 = await userSchema.create({
        name: "Dr. Priya",
        email: "priya@gmail.com",
        password: hashedPassword,
        phone: "9988776655",
        isdoctor: true,
        type: "doctor",
      });

      // 6b. Create third Doctor User (Approved)
      const doctorUser4 = await userSchema.create({
        name: "Dr. Amit",
        email: "amit@gmail.com",
        password: hashedPassword,
        phone: "9812345670",
        isdoctor: true,
        type: "doctor",
      });

      // 6c. Create fourth Doctor User (Approved)
      const doctorUser5 = await userSchema.create({
        name: "Dr. Sneha",
        email: "sneha@gmail.com",
        password: hashedPassword,
        phone: "9832145678",
        isdoctor: true,
        type: "doctor",
      });

      // 7. Create Doctor Profile (Approved) - Dr. Kaushik
      const doctorProfile = await docSchema.create({
        userId: doctorUser._id,
        fullName: "Kaushik",
        name: doctorUser.name,
        email: doctorUser.email,
        phone: doctorUser.phone,
        address: "Chennai",
        specialization: "Blood Test & Pathology",
        experience: "10 yrs",
        fees: 1000,
        timings: "11:00 - 14:00",
        status: "approved",
      });

      // 8. Create Doctor Profile (Approved) - Dr. Priya
      const doctorProfile3 = await docSchema.create({
        userId: doctorUser3._id,
        fullName: "Priya",
        name: doctorUser3.name,
        email: doctorUser3.email,
        phone: doctorUser3.phone,
        address: "Hyderabad",
        specialization: "Neurology",
        experience: "7 yrs",
        fees: 1200,
        timings: "09:00 - 12:00",
        status: "approved",
      });

      // 8b. Create Doctor Profile (Approved) - Dr. Amit
      const doctorProfile4 = await docSchema.create({
        userId: doctorUser4._id,
        fullName: "Amit Verma",
        name: doctorUser4.name,
        email: doctorUser4.email,
        phone: doctorUser4.phone,
        address: "New Delhi",
        specialization: "Cardiology",
        experience: "12 yrs",
        fees: 1500,
        timings: "10:00 - 16:00",
        status: "approved",
      });

      // 8c. Create Doctor Profile (Approved) - Dr. Sneha
      const doctorProfile5 = await docSchema.create({
        userId: doctorUser5._id,
        fullName: "Sneha Patel",
        name: doctorUser5.name,
        email: doctorUser5.email,
        phone: doctorUser5.phone,
        address: "Mumbai",
        specialization: "Pediatrics",
        experience: "8 yrs",
        fees: 900,
        timings: "14:00 - 18:00",
        status: "approved",
      });

      // 9. Create Doctor User (Pending Approval)
      const doctorUser2 = await userSchema.create({
        name: "Dr. Karthik",
        email: "karthik@gmail.com",
        password: hashedPassword,
        phone: "0987654322",
        isdoctor: false,
        type: "patient",
      });

      // 10. Create Doctor Profile (Pending)
      await docSchema.create({
        userId: doctorUser2._id,
        fullName: "Karthik",
        name: doctorUser2.name,
        email: doctorUser2.email,
        phone: doctorUser2.phone,
        address: "Bangalore",
        specialization: "Skin",
        experience: "5 yrs",
        fees: 800,
        timings: "16:00 - 19:00",
        status: "pending",
      });

      // ─── SEED APPOINTMENTS ─────────────────────────────────────────────────

      // Appointment 1 - Approved
      await appointSchema.create({
        userId: patientUser._id,
        doctorId: doctorProfile._id,
        date: "2026-07-01",
        time: "11:00",
        document: { path: "uploads/sample_report.pdf", originalname: "sample_report.pdf" },
        status: "approved",
        userInfo: { name: patientUser.name, email: patientUser.email, phone: patientUser.phone },
        docInfo: { name: doctorProfile.fullName, specialization: doctorProfile.specialization, fees: doctorProfile.fees }
      });

      // Appointment 2 - Pending
      await appointSchema.create({
        userId: patientUser._id,
        doctorId: doctorProfile._id,
        date: "2026-07-05",
        time: "13:00",
        document: { path: "uploads/blood_test.pdf", originalname: "blood_test.pdf" },
        status: "pending",
        userInfo: { name: patientUser.name, email: patientUser.email, phone: patientUser.phone },
        docInfo: { name: doctorProfile.fullName, specialization: doctorProfile.specialization, fees: doctorProfile.fees }
      });

      // Appointment 3 - Rejected
      await appointSchema.create({
        userId: patientUser._id,
        doctorId: doctorProfile3._id,
        date: "2026-06-28",
        time: "10:00",
        document: { path: "uploads/mri_scan.pdf", originalname: "mri_scan.pdf" },
        status: "rejected",
        userInfo: { name: patientUser.name, email: patientUser.email, phone: patientUser.phone },
        docInfo: { name: doctorProfile3.fullName, specialization: doctorProfile3.specialization, fees: doctorProfile3.fees }
      });

      // Appointment 4 - Approved (Anjali)
      await appointSchema.create({
        userId: patientUser2._id,
        doctorId: doctorProfile._id,
        date: "2026-07-03",
        time: "12:30",
        document: { path: "uploads/cbc_report.pdf", originalname: "cbc_report.pdf" },
        status: "approved",
        userInfo: { name: patientUser2.name, email: patientUser2.email, phone: patientUser2.phone },
        docInfo: { name: doctorProfile.fullName, specialization: doctorProfile.specialization, fees: doctorProfile.fees }
      });

      // Appointment 5 - Pending (Anjali)
      await appointSchema.create({
        userId: patientUser2._id,
        doctorId: doctorProfile3._id,
        date: "2026-07-08",
        time: "09:30",
        document: { path: "uploads/eeg_report.pdf", originalname: "eeg_report.pdf" },
        status: "pending",
        userInfo: { name: patientUser2.name, email: patientUser2.email, phone: patientUser2.phone },
        docInfo: { name: doctorProfile3.fullName, specialization: doctorProfile3.specialization, fees: doctorProfile3.fees }
      });

      // Appointment 6 - Approved (Ravi)
      await appointSchema.create({
        userId: patientUser3._id,
        doctorId: doctorProfile3._id,
        date: "2026-07-02",
        time: "11:30",
        document: { path: "uploads/xray.pdf", originalname: "xray.pdf" },
        status: "approved",
        userInfo: { name: patientUser3.name, email: patientUser3.email, phone: patientUser3.phone },
        docInfo: { name: doctorProfile3.fullName, specialization: doctorProfile3.specialization, fees: doctorProfile3.fees }
      });

      // Appointment 7 - Rejected (Ravi)
      await appointSchema.create({
        userId: patientUser3._id,
        doctorId: doctorProfile._id,
        date: "2026-06-25",
        time: "13:30",
        document: { path: "uploads/ecg_report.pdf", originalname: "ecg_report.pdf" },
        status: "rejected",
        userInfo: { name: patientUser3.name, email: patientUser3.email, phone: patientUser3.phone },
        docInfo: { name: doctorProfile.fullName, specialization: doctorProfile.specialization, fees: doctorProfile.fees }
      });

      // ─── SEED NOTIFICATIONS ──────────────────────────────────────────────

      patientUser.notification = [
        {
          type: "appointment-status-update",
          message: "Your appointment with Dr. Kaushik on 2026-07-01 at 11:00 has been approved",
          onClickPath: "/appointments",
        },
        {
          type: "appointment-status-update",
          message: "Your appointment with Dr. Priya on 2026-06-28 at 10:00 has been rejected",
          onClickPath: "/appointments",
        },
      ];
      patientUser.seenNotification = [
        {
          type: "appointment-status-update",
          message: "Welcome to MediCareBook! Start by finding a doctor.",
          onClickPath: "/home",
        },
      ];
      await patientUser.save();

      adminUser.notification = [
        {
          type: "new-doctor-request",
          message: "Dr. Karthik has applied for a doctor account",
          data: { name: "Dr. Karthik" },
          onClickPath: "/admin-doctors",
        },
      ];
      await adminUser.save();

      doctorUser.notification = [
        {
          type: "new-appointment-request",
          message: "New appointment request from User on 2026-07-05 at 13:00",
          onClickPath: "/doctor-appointments",
        },
        {
          type: "new-appointment-request",
          message: "New appointment request from Anjali on 2026-07-03 at 12:30",
          onClickPath: "/doctor-appointments",
        },
      ];
      await doctorUser.save();

      console.log("Default data seeded successfully (with appointments & notifications)!");
    }
  } catch (error) {
    console.error("Auto seeding failed:", error);
  }
};

const connectToDB = async () => {
  try {
    console.log("Starting MongoDB Memory Server...");
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: "book-a-doctor",
      },
    });

    const uri = mongod.getUri();
    console.log(`In-Memory MongoDB URI: ${uri}`);
    process.env.MONGO_URI = uri; // set for compatibility
    
    await mongoose.connect(uri);
    console.log("MongoDB Connected");

    await seedIfEmpty();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectToDB;
module.exports.mongod = mongod;

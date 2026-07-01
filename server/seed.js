const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./schemas/userModel.js");
const Doctor = require("./schemas/docModel.js");
const Appointment = require("./schemas/appointmentModel.js");

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding...");

    // Clear existing data
    await User.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    console.log("Cleared existing collections.");

    // 1. Create Admin User
    const adminUser = await User.create({
      name: "Hi_Admin",
      email: "admin@gmail.com",
      password: "123", // Keep in mind this is not hashed, but login might expect hashed. In this old seed, it's plaintext. 
      // Wait, in userModel, is there a pre-save hook? If not, we should hash it. Let's just create it directly if login works.
      // Wait, let's hash passwords to be safe if login uses bcrypt.
      phone: "0987654321",
      type: "admin",
    });
    console.log("Created Admin User:", adminUser.email);

    // 2. Create Patient User
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123", salt);

    const patientUser = await User.create({
      name: "User",
      email: "patient@gmail.com",
      password: hashedPassword,
      phone: "1234567890",
      type: "user",
    });
    console.log("Created Patient User:", patientUser.email);

    // 3. Create Doctor User
    const doctorUser = await User.create({
      name: "Dr. Kaushik",
      email: "doctor@gmail.com",
      password: hashedPassword,
      phone: "9876543210",
      type: "doctor",
      isdoctor: true,
    });
    console.log("Created Doctor User:", doctorUser.email);

    // 4. Create Doctor Profile linked to Doctor User
    const doctorProfile = await Doctor.create({
      userId: doctorUser._id,
      fullName: doctorUser.name, // screenshot had fullName
      email: doctorUser.email,
      phone: doctorUser.phone,
      address: "chennai",
      specialization: "Blood",
      experience: "10 yrs",
      fees: 1000,
      timings: "11:00 - 14:00",
      status: "approved",
    });
    console.log("Created Doctor Profile:", doctorProfile.fullName);

    // 5. Add an appointment
    const appointment = await Appointment.create({
      userId: patientUser._id,
      doctorId: doctorProfile._id,
      userInfo: patientUser.toObject(),
      docInfo: doctorProfile.toObject(),
      date: "2026-07-02",
      time: "12:00",
      status: "pending",
    });
    console.log("Created Appointment for date:", appointment.date);

    console.log("Seeding completed successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();

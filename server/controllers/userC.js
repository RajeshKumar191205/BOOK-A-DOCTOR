const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const userSchema = require("../schemas/userModel");
const docSchema = require("../schemas/docModel");
const appointSchema = require("../schemas/appointmentModel");

const registerController = async (req, res) => {
  try {
    const existsUser = await userSchema.findOne({ email: req.body.email });
    if (existsUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    
    // Set isdoctor and type based on role if it is passed (for compatibility)
    if (req.body.role === "admin") {
      if (req.body.email.toLowerCase() !== "rajeshkumarkara05@gmail.com") {
        return res.status(200).send({
          success: false,
          message: "Registration failed: Only rajeshkumarkara05@gmail.com is authorized to register as Admin."
        });
      }
      req.body.type = "admin";
    } else if (req.body.role === "doctor") {
      req.body.type = "doctor";
      req.body.isdoctor = true;
    } else {
      req.body.type = "patient";
    }

    const newUser = new userSchema(req.body);
    await newUser.save();

    // Map properties to flat structure for compatibility
    const responseObj = {
      message: "Register Success",
      success: true,
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.type === "admin" ? "admin" : (newUser.isdoctor ? "doctor" : "user"),
      isDoctor: newUser.isdoctor,
      token: jwt.sign({ id: newUser._id }, process.env.JWT_KEY || process.env.JWT_SECRET || "supersecretkey12345", {
        expiresIn: "1d",
      })
    };

    return res.status(201).send(responseObj);
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

const loginController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid email or password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY || process.env.JWT_SECRET || "supersecretkey12345", {
      expiresIn: "1d",
    });

    res.status(200).send({
      message: "Login Success",
      success: true,
      token,
      data: user,
      userData: user,
      // Compatibility fields for the frontend
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.type === "admin" ? "admin" : (user.isdoctor ? "doctor" : "user"),
      isDoctor: user.isdoctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    } else {
      user.password = undefined;
      res.status(200).send({
        success: true,
        data: user,
        userData: user,
        // Compatibility fields for the frontend
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.type === "admin" ? "admin" : (user.isdoctor ? "doctor" : "user"),
        isDoctor: user.isdoctor,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "auth error", success: false, error });
  }
};

const docController = async (req, res) => {
  try {
    // Map timings string to Object if needed, or save directly.
    // In docModel.js, timings is Mixed.
    const newDoctor = await docSchema({ ...req.body, status: "pending" });
    await newDoctor.save();
    
    // Notify all admin users
    const adminUser = await userSchema.findOne({ type: "admin" });
    if (adminUser) {
      const notification = adminUser.notification;
      notification.push({
        type: "apply-doctor-request",
        message: `${newDoctor.fullName} has applied for a doctor account`,
        data: {
          doctorId: newDoctor._id,
          name: newDoctor.fullName,
          onClickPath: "/admin/doctors",
        },
      });
      await userSchema.findByIdAndUpdate(adminUser._id, { notification });
    }
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied Successfully",
      data: newDoctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while applying for doctor",
    });
  }
};

const getallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    const seenNotification = user.seenNotification;
    const notification = user.notification;
    seenNotification.push(...notification);
    user.notification = [];
    user.seenNotification = seenNotification;
    const updateUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notifications are marked as seen",
      data: updateUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

const deleteallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seenNotification = [];
    const updateUser = await user.save();
    updateUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notification deleted successfully",
      data: updateUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete notifications",
      error,
    });
  }
};

const getAllDoctorsControllers = async (req, res) => {
  try {
    const doctors = await docSchema.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctors list fetched successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "error while fetching doctors",
    });
  }
};

const appointmentController = async (req, res) => {
  try {
    req.body.date = req.body.date;
    req.body.status = "pending";
    if (req.file) {
      req.body.document = {
        path: `uploads/${req.file.filename}`,
        originalname: req.file.originalname,
      };
    }
    
    // Add compatibility mapping: in docModel.js userId is ref: "users"
    const doctorProfile = await docSchema.findOne({ _id: req.body.doctorId });
    if (!doctorProfile) {
      return res.status(404).send({ success: false, message: "Doctor not found" });
    }

    // Populate userInfo/docInfo for database query
    const patientUser = await userSchema.findById(req.body.userId);
    req.body.userInfo = {
      name: patientUser ? patientUser.name : "Patient",
      email: patientUser ? patientUser.email : "",
      phone: patientUser ? patientUser.phone : ""
    };
    req.body.docInfo = {
      name: doctorProfile.fullName,
      specialization: doctorProfile.specialization,
      fees: doctorProfile.fees
    };

    const newAppointment = new appointSchema(req.body);
    await newAppointment.save();
    
    // Notify the doctor user
    const doctorUser = await userSchema.findOne({ _id: doctorProfile.userId });
    if (doctorUser) {
      const notification = doctorUser.notification;
      notification.push({
        type: "New-appointment-request",
        message: `A new appointment request from ${req.body.userInfo.name}`,
        onClickPath: "/doctor/appointments",
      });
      await doctorUser.save();
    }
    
    res.status(200).send({
      success: true,
      message: "Appointment book successfully",
      data: newAppointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while booking appointment",
    });
  }
};

const getAllUserAppointments = async (req, res) => {
  try {
    const appointments = await appointSchema.find({ userId: req.body.userId })
      .populate("doctorId");
    
    // Enriched appointments for client compatibility (populating doctorId, etc.)
    const enriched = appointments.map(app => {
      const obj = app.toObject();
      obj.doctorName = app.docInfo?.name || app.doctorId?.fullName || "Doctor";
      return obj;
    });

    res.status(200).send({
      success: true,
      message: "All the appointments are listed below.",
      data: enriched,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "searching went wrong",
    });
  }
};

const getDocsController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    const allDoc = user.document || [];
    res.status(200).send({
      message: "No Documents",
      success: true,
      data: allDoc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "something went wrong",
    });
  }
};

module.exports = {
  registerController,
  loginController,
  authController,
  docController,
  getallnotificationController,
  deleteallnotificationController,
  getAllDoctorsControllers,
  appointmentController,
  getAllUserAppointments,
  getDocsController,
};

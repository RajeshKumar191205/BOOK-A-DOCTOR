const docSchema = require("../schemas/docModel");
const appointSchema = require("../schemas/appointmentModel");
const userSchema = require("../schemas/userModel");
const fs = require("fs");
const path = require("path");

const updateDoctorProfileController = async (req, res) => {
  console.log(req.body);
  try {
    const doctor = await docSchema.findOneAndUpdate(
      { userId: req.body.userId },
      req.body,
      { new: true }
    );
    if (doctor) {
      await doctor.save();
    }
    return res.status(200).send({
      success: true,
      data: doctor,
      message: "Successfully updated profile",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};

const getAllDoctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await docSchema.findOne({ userId: req.body.userId });
    if (!doctor) {
      return res.status(200).send({
        message: "No doctor profile found",
        success: true,
        data: []
      });
    }
    const allAppointments = await appointSchema.find({
      doctorId: doctor._id,
    }).populate("userId", "name email phone");
    
    return res.status(200).send({
      message: "All the appointments are listed below.",
      success: true,
      data: allAppointments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};

const handleStatusController = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await appointSchema.findByIdAndUpdate(
      { _id: appointmentId },
      { status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).send({ message: "Appointment not found", success: false });
    }
    const user = await userSchema.findOne({ _id: appointment.userId });
    if (user) {
      const notification = user.notification;
      notification.push({
        type: "status-update",
        message: `Your appointment has been ${status}`,
        onClickPath: "/appointments",
      });
      await user.save();
    }
    return res.status(200).send({
      message: "successfully updated status",
      success: true,
      data: appointment
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};

const documentDownloadController = async (req, res) => {
  try {
    const appointId = req.query.appointId;
    const appointment = await appointSchema.findById({ _id: appointId });
    if (!appointment) {
      return res.status(404).send({ message: "Appointment not found" });
    }
    const documentObj = appointment.document;
    if (!documentObj || typeof documentObj !== "object" || !documentObj.path) {
      return res.status(400).send({ message: "Document URL is invalid", success: false });
    }
    // Set direct uploads directory
    const absoluteFilePath = path.join(__dirname, "..", documentObj.path);
    fs.access(absoluteFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send({ message: "File not found", success: false, error: err });
      }
      res.set({
        "Content-Disposition": `attachment; filename="${path.basename(absoluteFilePath)}"`,
        "Content-Type": "application/octet-stream",
      });
      const fileStream = fs.createReadStream(absoluteFilePath);
      fileStream.on("error", (error) => {
        console.log(error);
        return res.status(500).send({ message: "Error reading the document", success: false, error: error });
      });
      fileStream.pipe(res);
      fileStream.on("end", () => {
        console.log("File download completed");
        res.end();
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "something went wrong", success: false });
  }
};

module.exports = {
  updateDoctorProfileController,
  getAllDoctorAppointmentsController,
  handleStatusController,
  documentDownloadController,
};

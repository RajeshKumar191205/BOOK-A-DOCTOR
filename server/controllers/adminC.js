const docSchema = require("../schemas/docModel");
const userSchema = require("../schemas/userModel");
const appointSchema = require("../schemas/appointmentModel");

const getAllUsersControllers = async (req, res) => {
  try {
    const users = await userSchema.find({});
    return res.status(200).send({
      message: "Users data list",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};

const getAllDoctorsControllers = async (req, res) => {
  try {
    const doctors = await docSchema.find({});
    return res.status(200).send({
      message: "Doctor list data list",
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};

const getStatusApproveController = async (req, res) => {
  try {
    const { doctorId, status, userId } = req.body;
    const doctor = await docSchema.findByIdAndUpdate(
      { _id: doctorId },
      { status },
      { new: true }
    );
    const user = await userSchema.findOne({ _id: userId });
    if (user) {
      const notification = user.notification;
      notification.push({
        type: "doctor-account-approved",
        message: `Your doctor account has been ${status}`,
        onClickPath: "/notification",
      });
      user.isdoctor = status === "approved";
      user.type = status === "approved" ? "doctor" : "patient";
      await user.save();
    }
    return res.status(201).send({
      message: "Successfully updated approved status of the doctor",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};

const getStatusRejectController = async (req, res) => {
  try {
    const { doctorId, status, userId } = req.body;
    const doctor = await docSchema.findByIdAndUpdate(
      { _id: doctorId },
      { status },
      { new: true }
    );
    const user = await userSchema.findOne({ _id: userId });
    if (user) {
      const notification = user.notification;
      notification.push({
        type: "doctor-account-rejected",
        message: `Your doctor account has been ${status}`,
        onClickPath: "/notification",
      });
      user.isdoctor = false;
      user.type = "patient";
      await user.save();
    }
    return res.status(201).send({
      message: "Successfully updated rejected status of the doctor",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};

const displayAllAppointmentController = async (req, res) => {
  try {
    const allappointments = await appointSchema.find({})
      .populate("userId", "name email phone")
      .populate("doctorId");
    return res.status(200).send({
      success: true,
      message: "Successfully fetched all Appointments",
      data: allappointments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};

module.exports = {
  getAllDoctorsControllers,
  getAllUsersControllers,
  getStatusApproveController,
  getStatusRejectController,
  displayAllAppointmentController,
};

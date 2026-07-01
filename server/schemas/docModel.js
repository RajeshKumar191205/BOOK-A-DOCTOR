const mongoose = require("mongoose");

const docModel = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      set: function (value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
    },
    address: {
      type: String,
      required: [true, "address required"],
    },
    specialization: {
      type: String,
      required: [true, "specialization is required"],
    },
    experience: {
      type: String,
      required: [true, "experience is required"],
    },
    fees: {
      type: Number,
      required: [true, "fees is required"],
    },
    status: {
      type: String,
      default: "pending",
    },
    timings: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "work time required"],
    },
  },
  {
    timestamps: true,
  }
);

const doctorModel = mongoose.model("doctor", docModel);
module.exports = doctorModel;

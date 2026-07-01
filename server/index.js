const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectToDB = require("./config/connectToDB");

const app = express();

//////////dotenv config////////////////////
dotenv.config();
connectToDB();

const PORT = process.env.PORT || 5000;

//////////middlewares//////////////////////
app.use(express.json());
app.use(cors());

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong", success: false });
});

//////////routes///////////////////////////
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));

//////////compatibility routes for existing frontend dashboard/////////

// 1. Auth routes
app.post("/api/auth/register", require("./controllers/userC").registerController);
app.post("/api/auth/login", require("./controllers/userC").loginController);
app.get("/api/auth/me", require("./middlewares/authMiddleware"), (req, res) => {
  require("./controllers/userC").authController(req, res);
});
app.get("/api/auth/users", require("./middlewares/authMiddleware"), require("./controllers/adminC").getAllUsersControllers);

// 2. Doctor routes
app.post("/api/doctors/apply", require("./middlewares/authMiddleware"), require("./controllers/userC").docController);
app.get("/api/doctors", require("./controllers/userC").getAllDoctorsControllers);
app.get("/api/doctors/my-application", require("./middlewares/authMiddleware"), async (req, res) => {
  try {
    const doc = await require("./schemas/docModel").findOne({ userId: req.body.userId });
    if (!doc) return res.status(404).json({ message: "No application found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/api/doctors/all", require("./middlewares/authMiddleware"), require("./controllers/adminC").getAllDoctorsControllers);
app.put("/api/doctors/:id/status", require("./middlewares/authMiddleware"), async (req, res) => {
  req.body.doctorId = req.params.id;
  const doc = await require("./schemas/docModel").findById(req.params.id);
  req.body.userId = doc ? doc.userId : null;
  if (req.body.status === "approved") {
    require("./controllers/adminC").getStatusApproveController(req, res);
  } else {
    require("./controllers/adminC").getStatusRejectController(req, res);
  }
});

// 3. Appointment routes
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.post("/api/appointments/book", require("./middlewares/authMiddleware"), upload.single("document"), require("./controllers/userC").appointmentController);
app.get("/api/appointments/user", require("./middlewares/authMiddleware"), require("./controllers/userC").getAllUserAppointments);
app.get("/api/appointments/doctor", require("./middlewares/authMiddleware"), require("./controllers/doctorC").getAllDoctorAppointmentsController);
app.get("/api/appointments/all", require("./middlewares/authMiddleware"), require("./controllers/adminC").displayAllAppointmentController);
app.put("/api/appointments/:id/status", require("./middlewares/authMiddleware"), async (req, res) => {
  req.body.appointmentId = req.params.id;
  require("./controllers/doctorC").handleStatusController(req, res);
});
app.get("/api/appointments/download/:appointmentId", require("./middlewares/authMiddleware"), (req, res) => {
  req.query.appointId = req.params.appointmentId;
  require("./controllers/doctorC").documentDownloadController(req, res);
});

// Notifications routes
app.post("/api/notifications/get-all", require("./middlewares/authMiddleware"), require("./controllers/userC").getallnotificationController);
app.post("/api/notifications/delete-all", require("./middlewares/authMiddleware"), require("./controllers/userC").deleteallnotificationController);

// Root
app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

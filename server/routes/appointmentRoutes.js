import express from 'express';
import { 
  bookAppointment, 
  getUserAppointments, 
  getDoctorAppointments, 
  getAllAppointments, 
  updateAppointmentStatus,
  documentDownloadController 
} from '../controllers/appointmentController.js';
import { protect, doctor, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/book', protect, upload.single('document'), bookAppointment);
router.get('/user', protect, getUserAppointments);
router.get('/doctor', protect, doctor, getDoctorAppointments);
router.get('/all', protect, admin, getAllAppointments);
router.put('/:id/status', protect, doctor, updateAppointmentStatus);
router.get('/download/:appointmentId', protect, documentDownloadController);

export default router;

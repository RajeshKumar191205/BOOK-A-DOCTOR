import express from 'express';
import { getallNotificationController, deleteallNotificationController } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mark all as seen (moves notification → seenNotification)
router.post('/get-all', protect, getallNotificationController);

// Delete all notifications
router.post('/delete-all', protect, deleteallNotificationController);

export default router;

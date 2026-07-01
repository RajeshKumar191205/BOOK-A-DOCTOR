import User from '../models/User.js';

// @desc    Get all notifications — moves unread to seenNotification
// @route   POST /api/notifications/get-all
// @access  Private
export const getallNotificationController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Move all unseen notifications to seenNotification
    user.seenNotification = [
      ...user.seenNotification,
      ...user.notification
    ];
    user.notification = [];

    const updatedUser = await user.save();

    // Return user without password
    const userData = updatedUser.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: userData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// @desc    Delete all notifications (clears both arrays)
// @route   POST /api/notifications/delete-all
// @access  Private
export const deleteallNotificationController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.notification = [];
    user.seenNotification = [];

    const updatedUser = await user.save();

    const userData = updatedUser.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'All notifications deleted',
      data: userData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

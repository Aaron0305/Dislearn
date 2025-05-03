    import express from 'express';
    import { protect, authorize } from '../middleware/authMiddleware.js';
    import { getUserProfile, updateUserProfile, getAllUsers, deleteUser } from '../controllers/userController.js';

    const router = express.Router();

    router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

    router.route('/')
    .get(protect, authorize('admin'), getAllUsers);

    router.route('/:id')
    .delete(protect, authorize('admin'), deleteUser);

    export default router;
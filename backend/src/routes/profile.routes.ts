import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const profileController = new ProfileController();

router.get(
    '/:userId',
    authenticate,
    profileController.getProfile.bind(profileController)
);

router.put(
    '/:userId',
    authenticate,
    profileController.updateProfile.bind(profileController)
);

router.post(
    '/:userId/upload-picture',
    authenticate,
    upload.single('profilePic'),
    profileController.uploadProfilePicture.bind(profileController)
);

export default router;

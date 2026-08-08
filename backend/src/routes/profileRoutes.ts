import { Router } from 'express';
import { getProfile, createProfile, updateProfile } from '../controllers/profileController';
import { validateBody } from '../middleware/validator';
import { createProfileSchema, updateProfileSchema } from '../validators';

const router = Router();

router.get('/:profileId', getProfile);
router.post('/', validateBody(createProfileSchema), createProfile);
router.patch('/:profileId', validateBody(updateProfileSchema), updateProfile);

export default router;

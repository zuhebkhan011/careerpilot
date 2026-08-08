import { Router } from 'express';
import {
  getApplicationsByProfile,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/applicationController';
import { validateBody } from '../middleware/validator';
import { createApplicationSchema, updateApplicationSchema } from '../validators';

const router = Router();

router.get('/:profileId', getApplicationsByProfile);
router.post('/', validateBody(createApplicationSchema), createApplication);
router.patch('/:applicationId', validateBody(updateApplicationSchema), updateApplication);
router.delete('/:applicationId', deleteApplication);

export default router;

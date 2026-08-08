import { Router } from 'express';
import {
  getJobs,
  getJobById,
  matchJob,
  getRecommendedJobs,
  generateCoverLetter,
} from '../controllers/jobController';

const router = Router();

router.get('/', getJobs);
router.get('/search', getJobs);
router.get('/recommended/:profileId', getRecommendedJobs);
router.get('/:jobId', getJobById);
router.post('/:jobId/match', matchJob);
router.post('/match-all', matchJob);
router.post('/:jobId/cover-letter', generateCoverLetter);

export default router;

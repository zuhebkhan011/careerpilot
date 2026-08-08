import { Router } from 'express';
import multer from 'multer';
import { analyzeResume, reviewResume, getResumesByProfile, getResumeById } from '../controllers/resumeController';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported for resume parsing'));
    }
  },
});

const router = Router();

router.post('/upload', upload.single('resume'), analyzeResume);
router.post('/analyze', upload.single('resume'), analyzeResume);
router.post('/review', reviewResume);
router.get('/profile/:profileId', getResumesByProfile);
router.get('/:resumeId', getResumeById);

export default router;

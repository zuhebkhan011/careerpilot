import { Router } from 'express';
import multer from 'multer';
import { analyzeResume, reviewResume, getResumesByProfile, getResumeById } from '../controllers/resumeController';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase();
    const isAllowed =
      ext.endsWith('.pdf') ||
      ext.endsWith('.txt') ||
      ext.endsWith('.doc') ||
      ext.endsWith('.docx') ||
      ext.endsWith('.md') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('text/') ||
      file.mimetype === 'application/octet-stream';

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(null, true); // Allow upload and handle extraction safely in controller
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

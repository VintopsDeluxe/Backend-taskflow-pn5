import { Router } from 'express';
import {
  getFilesByTask,
  uploadAndRegisterAttachment,
  deleteAttachment,
  uploadSingleFile,
} from '../controllers/fileController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateUser);

router.get('/task/:taskId', getFilesByTask);
router.post('/', uploadSingleFile, uploadAndRegisterAttachment);
router.delete('/:id', deleteAttachment);

export default router;
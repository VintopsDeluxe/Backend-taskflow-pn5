import { Router } from 'express';
import { getFilesByTask, registerAttachment, deleteAttachment } from '../controllers/fileController.js';

const router = Router();

router.get('/task/:taskId', getFilesByTask);
router.post('/', registerAttachment);
router.delete('/:id', deleteAttachment);

export default router;
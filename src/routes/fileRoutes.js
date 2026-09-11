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

/**
 * @swagger
 * /api/v1/files/task/{taskId}:
 *   get:
 *     summary: Fetch all file attachments for a specific task
 *     tags: [Files]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get('/task/:taskId', getFilesByTask);

/**
 * @swagger
 * /api/v1/files:
 *   post:
 *     summary: Upload and register a single file attachment
 *     tags: [Files]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       201:
 *         description: File uploaded and registered successfully
 *       400:
 *         description: Bad request or missing file
 *       401:
 *         description: Unauthorized
 */
router.post('/', uploadSingleFile, uploadAndRegisterAttachment);

/**
 * @swagger
 * /api/v1/files/{id}:
 *   delete:
 *     summary: Delete a file attachment by its ID
 *     tags: [Files]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The attachment ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
router.delete('/:id', deleteAttachment);

export default router;
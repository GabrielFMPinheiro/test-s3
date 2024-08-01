import { Router, Request, Response } from 'express';
import multer from '../middleware/multer';
import rollbar from '../config/rollbar';
import S3Service from '../services/s3Service';
import logger from '../config/logger';

const router = Router();
const s3Service = new S3Service();

router.post('/upload-proof', multer.single('file'), async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;

  if (!file) {
    res.status(400).send({ message: 'File not found.' });
    return;
  }

  try {
    await s3Service.uploadFile({
      bucket: process.env.DISTRIBUITED_GENERATION_BUCKET!,
      key: `documents/utility-bill-receipt/${file.originalname}`,
      file,
    });
    res.status(200).json({
      message: `File ${file.originalname} uploaded successfully.`,
    });
  } catch (error) {
    const msg = {
      message: `An error occurred while processing the file ${file.originalname}. Please try again later.`,
    };
    rollbar.error(error, msg);
    logger.error(msg.message);
    res.status(500).json(msg);
  }
});

export default router;

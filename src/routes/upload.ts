import { Router, Request, Response } from 'express';
import rollbar from '../config/rollbar';
import S3Service from '../services/s3Service';
import logger from '../config/logger';
import FileUpload from '../middleware/file-uploader';

const router = Router();

const uploadRoutes = (fileUpload: FileUpload, s3Service: S3Service) => {
  router.post(
    '/upload-proof',
    fileUpload.getUploadMiddleware().array('files', 10),
    fileUpload.multerErrorHandler,
    async (req: Request, res: Response) => {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).send({ message: 'No files were uploaded. Please upload at least one file.' });
        return;
      }

      if (files.length > 10) {
        res.status(400).send({ message: 'You can only upload up to 10 files at a time.' });
        return;
      }

      try {
        // Handle file uploads
        const uploadPromises = files.map((file) => {
          return s3Service
            .uploadFile({
              bucket: process.env.DISTRIBUITED_GENERATION_BUCKET!,
              key: `documents/utility-bill-receipt/${file.originalname}`,
              file,
            })
            .then(() => file.originalname);
        });

        const uploadedFileNames = await Promise.all(uploadPromises);

        res.status(200).json({
          message: `${files.length} file(s) uploaded successfully.`,
          files: JSON.stringify(uploadedFileNames),
        });
      } catch (error) {
        const msg = {
          message: 'An error occurred while processing the files. Please try again later.',
        };
        rollbar.error(error, msg);
        logger.error(msg.message);
        res.status(500).json(msg);
      }
    },
  );

  return router;
};

export default uploadRoutes;

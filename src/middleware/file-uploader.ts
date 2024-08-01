import multer, { MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import rollbar from '../config/rollbar';

class FileUpload {
  private upload: multer.Multer;

  constructor() {
    this.upload = multer({
      dest: '/tmp',
      limits: {
        files: 10,
        fileSize: 1 * 1024 * 1024, // 1MB em bytes
      },
    });
  }

  public getUploadMiddleware() {
    return this.upload;
  }

  public multerErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof MulterError) {
      let errorMessage = 'An error occurred with file upload.';

      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          errorMessage = 'One or more files exceed the 1MB limit. Please upload smaller files.';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          errorMessage = 'Too many files. Only upload up to 10 files at a time.';
          break;
        case 'LIMIT_FILE_COUNT':
          errorMessage = 'The number of files exceeds the allowed limit.';
          break;
        default:
          errorMessage = `An error occurred during file upload.`;
      }
      logger.error(err);
      rollbar.error(err);
      return res.status(400).json({
        message: errorMessage,
      });
    } else {
      next(err); // Passa erros não relacionados ao multer para o middleware de erro global
    }
  }
}

export default FileUpload;

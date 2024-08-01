import express from 'express';
import serverless from 'serverless-http';
import 'dotenv/config';
import './config/rollbar';
import logger from './config/logger';
import rollbar from './config/rollbar';
import FileUpload from './middleware/file-uploader';
import S3Service from './services/s3Service';
import uploadRoutes from './routes/upload';

const app = express();

const s3Service = new S3Service();
const fileUpload = new FileUpload();

app.use('/billing', uploadRoutes(fileUpload, s3Service));

app.use((err: any, _req: express.Request, res: express.Response) => {
  rollbar.error(err);
  logger.error('Global error handler:', err);
  res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
});

export default app;
module.exports.handler = serverless(app);

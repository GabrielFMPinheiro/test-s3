import express, { Request, Response } from 'express';
import AWS from 'aws-sdk';
import multer from 'multer';
import serverless from 'serverless-http';
import fs from 'fs';
import Rollbar from 'rollbar';
import 'dotenv/config';

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN!,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.ROLLBAR_ENVIRONMENT,
});

const app = express();

const s3 = new AWS.S3();

const upload = multer({
  dest: '/tmp',
});

app.post('/billing/upload-proof', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;

  if (!file) {
    res.status(400).send({ message: 'File not found.' });
    return;
  }

  try {
    const fileContent = fs.readFileSync(file.path);

    const keyName = `documents/utility-bill-receipt/${file.originalname}`;

    const params = {
      Bucket: process.env.DISTRIBUITED_GENERATION_BUCKET!,
      Key: keyName,
      Body: fileContent,
    };

    await s3.upload(params).promise();

    await fs.promises.unlink(file.path);

    res.status(200).json({
      message: `File ${file.originalname} uploaded successfully.`,
    });
    return;
  } catch (error) {
    const msg = {
      message: `An error occurred while processing the file ${file.originalname}. Please try again later.`,
    };
    rollbar.error(error, msg);
    console.error(msg);
    res.status(500).json(msg);
    return;
  }
});

module.exports.handler = serverless(app);

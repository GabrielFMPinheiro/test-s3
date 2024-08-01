import express, { Request, Response } from "express";
import AWS from "aws-sdk";
import multer from "multer";
import serverless from "serverless-http";
import fs from "fs";
import { exec } from "child_process";

const app = express();

const s3 = new AWS.S3();

// Configurar multer para armazenar arquivos temporariamente
const upload = multer({
  dest: "/tmp",
});

app.post(
  "/billing/upload-proof",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    // console.log("TAMANHO", files.length);
    if (!file) {
      return res.status(400).send("No files uploaded.");
    }

    try {
      // const uploadPromises = files.map(async (file) => {
      const fileContent = fs.readFileSync(file.path);

      const params = {
        Bucket: "my-bucket-s3-gabriel-pinheiro",
        Key: file.originalname,
        Body: fileContent,
      };

      await s3.upload(params).promise();

      await fs.promises.unlink(file.path);

      // await Promise.all(uploadPromises);

      return res.status(200).send("Files uploaded successfully.");
    } catch (error) {
      console.error(error);
      const errorMessage = (error as any).message;
      if (errorMessage.indexOf("ENOSPC") > -1) {
        console.log("Got ENOSPC! Check out df output:\n", await exec("df -h"));
        console.log(await exec('du -h / 2>&1 | grep -v "Permission denied"'));
      }
      return res.status(500).json({
        test: "teste",
        error: error,
      });
    }
  }
);

module.exports.handler = serverless(app);

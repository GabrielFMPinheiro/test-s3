import AWS from 'aws-sdk';
import fs from 'fs';

interface UploadParams {
  bucket: string;
  key: string;
  file: Express.Multer.File;
}

class S3Service {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3();
  }

  public async uploadFile({ bucket, key, file }: UploadParams): Promise<void> {
    const fileContent = fs.readFileSync(file.path);

    const params = {
      Bucket: bucket,
      Key: key,
      Body: fileContent,
    };

    await this.s3.upload(params).promise();

    await fs.promises.unlink(file.path);
  }
}

export default S3Service;

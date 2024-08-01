import request from 'supertest';
import rollbar from '../../src/config/rollbar';
import logger from '../../src/config/logger';
import AWS from 'aws-sdk';
import app from '../../src/app';
import path from 'path';
import fs from 'fs';

// Mock do AWS S3
const mockUpload = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue({}),
});
AWS.S3.prototype.upload = mockUpload;

describe('FileUpload Component Tests', () => {
  it('should return error if file size exceeds limit', async () => {
    const largeFile = Buffer.alloc(2 * 1024 * 1024, 'a'); // 2MB file
    const response = await request(app).post('/billing/upload-proof').attach('files', largeFile, 'largeFile.txt');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('One or more files exceed the 1MB limit. Please upload smaller files.');
  });

  it('should return error if too many files are uploaded', async () => {
    // Gera nomes de arquivos numerados de 1 a 11
    const fileNames = Array.from({ length: 11 }, (_, i) => `testFile${i + 1}.txt`);

    const testFilePaths = fileNames.map((fileName) => {
      const filePath = path.join(__dirname, fileName);
      fs.writeFileSync(filePath, 'Test file content');
      return filePath;
    });

    const requestBuilder = request(app).post('/billing/upload-proof');

    testFilePaths.forEach((filePath) => {
      requestBuilder.attach('files', filePath);
    });

    const response = await requestBuilder;

    testFilePaths.forEach((filePath) => {
      fs.unlinkSync(filePath);
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('The number of files exceeds the allowed limit.');
  });

  it('should log and report errors using logger and rollbar', async () => {
    const loggerSpy = jest.spyOn(logger, 'error');
    const rollbarSpy = jest.spyOn(rollbar, 'error');

    const response = await request(app)
      .post('/billing/upload-proof')
      .attach('files', Buffer.alloc(2 * 1024 * 1024, 'a'), 'largeFile.txt'); // 2MB file

    expect(response.status).toBe(400);
    expect(loggerSpy).toHaveBeenCalled();
    expect(rollbarSpy).toHaveBeenCalled();
  });
});

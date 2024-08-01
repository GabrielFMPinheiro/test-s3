import request from 'supertest';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import app from '../../src/app';

// Mock do AWS S3
const mockUpload = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue({}),
});
AWS.S3.prototype.upload = mockUpload;

describe('POST /billing/upload-proof', () => {
  it('should upload a file successfully', async () => {
    const testFilePath = path.join(__dirname, 'testFile.txt');
    fs.writeFileSync(testFilePath, 'Test file content');

    const response = await request(app).post('/billing/upload-proof').attach('files', testFilePath);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ files: '["testFile.txt"]', message: '1 file(s) uploaded successfully.' });
    expect(mockUpload).toHaveBeenCalled();

    fs.unlinkSync(testFilePath);
  });

  it('should return a 400 error if more than 10 documents are inserted', async () => {
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

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('The number of files exceeds the allowed limit.');
    expect(mockUpload).toHaveBeenCalled();

    testFilePaths.forEach((filePath) => {
      fs.unlinkSync(filePath);
    });
  });

  it('should return 400 if file is not found', async () => {
    const response = await request(app).post('/billing/upload-proof');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('No files were uploaded.');
  });

  it('should handle upload errors', async () => {
    mockUpload.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValue(new Error('S3 upload failed')),
    });

    const testFilePath = path.join(__dirname, 'testFile.txt');
    fs.writeFileSync(testFilePath, 'Test file content');

    const response = await request(app).post('/billing/upload-proof').attach('files', testFilePath);

    expect(response.status).toBe(500);
    expect(response.body.message).toContain('An error occurred while processing the file');

    fs.unlinkSync(testFilePath);
  });
});

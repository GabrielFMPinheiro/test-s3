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

    const response = await request(app).post('/billing/upload-proof').attach('file', testFilePath);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('File testFile.txt uploaded successfully.');
    expect(mockUpload).toHaveBeenCalled();

    fs.unlinkSync(testFilePath);
  });

  it('should return 400 if file is not found', async () => {
    const response = await request(app).post('/billing/upload-proof');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('File not found.');
  });

  it('should handle upload errors', async () => {
    mockUpload.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValue(new Error('S3 upload failed')),
    });

    const testFilePath = path.join(__dirname, 'testFile.txt');
    fs.writeFileSync(testFilePath, 'Test file content');

    const response = await request(app).post('/billing/upload-proof').attach('file', testFilePath);

    expect(response.status).toBe(500);
    expect(response.body.message).toContain('An error occurred while processing the file');

    fs.unlinkSync(testFilePath);
  });
});

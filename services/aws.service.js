import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

async function uploadFile(file) {
  const bucketName = process.env.BUCKET_NAME;
  const key = file.originalname.replace(/\.[^/.]+$/, '') + '.jpg';

  try {
    const processedBuffer = await sharp(file.buffer)
      .resize({ width: 150, height: 150 })
      .jpeg({ quality: 80 })
      .toBuffer();

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: processedBuffer,
      ContentType: 'image/jpeg',
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return { success: true, message: 'File uploaded successfully' };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

async function downloadFile(key) {
  const bucketName = process.env.BUCKET_NAME;

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

async function listObjectUrls() {
  const bucketName = process.env.BUCKET_NAME;
  const objectDetails = [];

  try {
    const params = {
      Bucket: bucketName,
    };

    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);

    for (const object of data.Contents) {
      const objectKey = object.Key;

      // Construct the Object URL
      const url = `https://${bucketName}.s3.${process.env.REGION}.amazonaws.com/${encodeURIComponent(objectKey)}`;

      // Push an object containing name and url to the array
      objectDetails.push({ name: objectKey, url: url });
    }

    return objectDetails;
  } catch (error) {
    console.error('Error listing objects:', error);
    throw error;
  }
}

export { uploadFile, downloadFile, listObjectUrls };

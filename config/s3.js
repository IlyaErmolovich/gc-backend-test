const AWS = require('aws-sdk');
require('dotenv').config();

// Конфигурация AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Название бакета
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

module.exports = {
  s3,
  BUCKET_NAME
}; 
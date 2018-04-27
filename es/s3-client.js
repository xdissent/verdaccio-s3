
import { S3 } from 'aws-sdk';

export default class S3Client {

  constructor(config) {
    this.config = config;
    this.s3 = new S3();
  }

  list(prefix) {
    return new Promise((resolve, reject) => {
      this.s3.listObjectsV2({ Bucket: this.config.bucket, Prefix: prefix }, (err, data) => err ? reject(err) : resolve(data.Contents.map(item => item.Key)));
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.s3.getObject({ Bucket: this.config.bucket, Key: key }, (err, data) => err ? reject(err) : resolve(data.Body.toString('utf8')));
    });
  }

  put(key, body) {
    return new Promise((resolve, reject) => {
      this.s3.putObject({ Bucket: this.config.bucket, Key: key, Body: body }, (err, data) => err ? reject(err) : resolve());
    });
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject({ Bucket: this.config.bucket, Key: key }, (err, data) => err ? reject(err) : resolve());
    });
  }

  upload(key, stream) {
    return this.s3.upload({ Bucket: this.config.bucket, Key: key, Body: stream });
  }
}
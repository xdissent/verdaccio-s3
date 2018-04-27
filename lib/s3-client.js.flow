// @flow

import type {Readable} from 'stream'
import {S3} from 'aws-sdk'
type Config = {
  bucket: string
}

export default class S3Client {
  config: Config
  s3: S3

  constructor(config: Config) {
    this.config = config
    this.s3 = new S3()
  }

  list(prefix: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.s3.listObjectsV2(
        {Bucket: this.config.bucket, Prefix: prefix},
        (err, data) =>
          err ? reject(err) : resolve(data.Contents.map(item => item.Key))
      )
    })
  }

  get(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.s3.getObject(
        {Bucket: this.config.bucket, Key: key},
        (err, data) => (err ? reject(err) : resolve(data.Body.toString('utf8')))
      )
    })
  }

  put(key: string, body: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.s3.putObject(
        {Bucket: this.config.bucket, Key: key, Body: body},
        (err, data) => (err ? reject(err) : resolve())
      )
    })
  }

  remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject(
        {Bucket: this.config.bucket, Key: key},
        (err, data) => (err ? reject(err) : resolve())
      )
    })
  }

  upload(key: string, stream: Readable) {
    return this.s3.upload({Bucket: this.config.bucket, Key: key, Body: stream})
  }
}

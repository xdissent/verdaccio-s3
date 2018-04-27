// @flow

import S3Client from './s3-client'
import {UploadTarball, ReadTarball} from '@verdaccio/streams'
import type {IUploadTarball, IReadTarball} from '@verdaccio/streams'
import type {Callback, Logger, Package} from '@verdaccio/types'
import type {ILocalPackageManager} from '@verdaccio/local-storage'

const noSuchKey = 'NoSuchKey'
const noSuchFile = 'ENOENT'
const pkgFileName = 'package.json'
const pkgInfoPrefix = 'info'
const tarballPrefix = 'data'

const pkgInfoKey = name => `${pkgInfoPrefix}/${name}/${pkgFileName}`
const tarballKey = name => `${tarballPrefix}/${name}`
const stringify = value => JSON.stringify(value, null, '\t')

export default class S3PackageManager implements ILocalPackageManager {
  logger: Logger
  s3: S3Client

  constructor(s3: S3Client, logger: Logger) {
    this.s3 = s3
    this.logger = logger
  }

  readPackage(name: string, callback: Callback) {
    this.s3.get(pkgInfoKey(name)).then(
      data => {
        try {
          callback(null, JSON.parse(data))
        } catch (err) {
          callback(err)
        }
      },
      err => {
        if (err && err.code === noSuchKey) err.code = noSuchFile
        callback(err)
      }
    )
  }

  createPackage(name: string, value: Package, callback: Callback) {
    this.s3
      .put(pkgInfoKey(name), stringify(value))
      .then(() => callback(null), callback)
  }

  savePackage(name: string, value: Package, callback: Callback) {
    this.s3
      .put(pkgInfoKey(name), stringify(value))
      .then(() => callback(null), callback)
  }

  updatePackage(
    name: string,
    updateHandler: Callback,
    onWrite: Callback,
    transformPackage: Function, // flowlint-line unclear-type:off
    onEnd: Callback
  ) {
    this.s3.get(pkgInfoKey(name)).then(data => {
      try {
        data = JSON.parse(data)
      } catch (err) {
        return onEnd(err)
      }
      updateHandler(data, err => {
        if (err) return onEnd(err)
        onWrite(name, transformPackage(data), onEnd)
      })
    }, onEnd)
  }

  writeTarball(name: string): IUploadTarball {
    const uploadStream = new UploadTarball()
    const s3upload = this.s3.upload(tarballKey(name), uploadStream)
    uploadStream.done = () => {}
    uploadStream.abort = () => s3upload.abort()
    s3upload
      .promise()
      .then(
        () => uploadStream.emit('success'),
        err => uploadStream.emit('error', err)
      )
    setTimeout(() => uploadStream.emit('open'))
    return uploadStream
  }

  readTarball(name: string): IReadTarball {
    let s3stream
    const readTarballStream = new ReadTarball()
    readTarballStream.abort = () => s3stream && s3stream.close()
    this.s3.s3.getObject(
      {
        Bucket: this.s3.config.bucket,
        Key: tarballKey(name)
      },
      (err, data) => {
        if (err) {
          if (err.code === noSuchKey) err.code = noSuchFile
          return readTarballStream.emit('error', err)
        }
        readTarballStream.emit('content-length', data.ContentLength)
        readTarballStream.emit('open')
        if (typeof data.Body === 'string' || data.Body instanceof Buffer)
          return readTarballStream.end(data.Body)
        data.Body.pipe(readTarballStream)
      }
    )
    return readTarballStream
  }

  deletePackage(name: string, callback: Callback) {
    this.s3.remove(tarballKey(name)).then(() => callback(null), callback)
  }

  removePackage(callback: Callback) {
    callback()
  }
}

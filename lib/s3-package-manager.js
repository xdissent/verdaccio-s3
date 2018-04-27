'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _s3Client = require('./s3-client');

var _s3Client2 = _interopRequireDefault(_s3Client);

var _streams = require('@verdaccio/streams');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const noSuchKey = 'NoSuchKey';
const noSuchFile = 'ENOENT';
const pkgFileName = 'package.json';
const pkgInfoPrefix = 'info';
const tarballPrefix = 'data';

const pkgInfoKey = name => `${pkgInfoPrefix}/${name}/${pkgFileName}`;
const tarballKey = name => `${tarballPrefix}/${name}`;
const stringify = value => JSON.stringify(value, null, '\t');

class S3PackageManager {

  constructor(s3, logger) {
    this.s3 = s3;
    this.logger = logger;
  }

  readPackage(name, callback) {
    this.s3.get(pkgInfoKey(name)).then(data => {
      try {
        callback(null, JSON.parse(data));
      } catch (err) {
        callback(err);
      }
    }, err => {
      if (err && err.code === noSuchKey) err.code = noSuchFile;
      callback(err);
    });
  }

  createPackage(name, value, callback) {
    this.s3.put(pkgInfoKey(name), stringify(value)).then(() => callback(null), callback);
  }

  savePackage(name, value, callback) {
    this.s3.put(pkgInfoKey(name), stringify(value)).then(() => callback(null), callback);
  }

  updatePackage(name, updateHandler, onWrite, transformPackage, // flowlint-line unclear-type:off
  onEnd) {
    this.s3.get(pkgInfoKey(name)).then(data => {
      try {
        data = JSON.parse(data);
      } catch (err) {
        return onEnd(err);
      }
      updateHandler(data, err => {
        if (err) return onEnd(err);
        onWrite(name, transformPackage(data), onEnd);
      });
    }, onEnd);
  }

  writeTarball(name) {
    const uploadStream = new _streams.UploadTarball();
    const s3upload = this.s3.upload(tarballKey(name), uploadStream);
    uploadStream.done = () => {};
    uploadStream.abort = () => s3upload.abort();
    s3upload.promise().then(() => uploadStream.emit('success'), err => uploadStream.emit('error', err));
    setTimeout(() => uploadStream.emit('open'));
    return uploadStream;
  }

  readTarball(name) {
    let s3stream;
    const readTarballStream = new _streams.ReadTarball();
    readTarballStream.abort = () => s3stream && s3stream.close();
    this.s3.s3.getObject({
      Bucket: this.s3.config.bucket,
      Key: tarballKey(name)
    }, (err, data) => {
      if (err) {
        if (err.code === noSuchKey) err.code = noSuchFile;
        return readTarballStream.emit('error', err);
      }
      readTarballStream.emit('content-length', data.ContentLength);
      readTarballStream.emit('open');
      if (typeof data.Body === 'string' || data.Body instanceof Buffer) return readTarballStream.end(data.Body);
      data.Body.pipe(readTarballStream);
    });
    return readTarballStream;
  }

  deletePackage(name, callback) {
    this.s3.remove(tarballKey(name)).then(() => callback(null), callback);
  }

  removePackage(callback) {
    callback();
  }
}
exports.default = S3PackageManager;
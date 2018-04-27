'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _s3Client = require('./s3-client');

var _s3Client2 = _interopRequireDefault(_s3Client);

var _s3PackageManager = require('./s3-package-manager');

var _s3PackageManager2 = _interopRequireDefault(_s3PackageManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class S3Database {

  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.s3 = new _s3Client2.default({
      // $FlowFixMe:
      bucket: this.config.store.s3.bucket
    });
  }

  get(callback) {
    this.s3.list('local').then(items => callback(null, items.map(item => item.replace(/^local\//, ''))), callback);
  }

  add(name, callback) {
    this.s3.put(`local/${name}`, '').then(() => callback(null), callback);
  }

  remove(name, callback) {
    this.s3.remove(`local/${name}`).then(() => callback(null), callback);
  }

  // $FlowFixMe:
  getSecret() {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        return yield _this.s3.get('secret');
      } catch (err) {
        if (err && err.code !== 'NoSuchKey') throw err;
      }
    })();
  }

  // $FlowFixMe:
  setSecret(secret) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.s3.put('secret', secret);
    })();
  }

  getPackageStorage(packageInfo) {
    return new _s3PackageManager2.default(this.s3, this.logger);
  }
}
exports.default = S3Database;
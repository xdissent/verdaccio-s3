// @flow

import S3Client from './s3-client'
import S3PackageManager from './s3-package-manager'
import type {Logger, Config, Callback} from '@verdaccio/types'
import type {IPackageStorage, ILocalData} from '@verdaccio/local-storage'

export default class S3Database implements ILocalData {
  logger: Logger
  config: Config
  s3: S3Client

  constructor(config: Config, logger: Logger) {
    this.config = config
    this.logger = logger
    this.s3 = new S3Client({
      // $FlowFixMe:
      bucket: this.config.store.s3.bucket
    })
  }

  get(callback: Callback) {
    this.s3
      .list('local')
      .then(
        items =>
          callback(null, items.map(item => item.replace(/^local\//, ''))),
        callback
      )
  }

  add(name: string, callback: Callback) {
    this.s3.put(`local/${name}`, '').then(() => callback(null), callback)
  }

  remove(name: string, callback: Callback) {
    this.s3.remove(`local/${name}`).then(() => callback(null), callback)
  }

  // $FlowFixMe:
  async getSecret(): Promise<?string> {
    try {
      return await this.s3.get('secret')
    } catch (err) {
      if (err && err.code !== 'NoSuchKey') throw err
    }
  }

  // $FlowFixMe:
  async setSecret(secret: string): Promise<void> {
    return this.s3.put('secret', secret)
  }

  getPackageStorage(packageInfo: string): IPackageStorage {
    return new S3PackageManager(this.s3, this.logger)
  }
}

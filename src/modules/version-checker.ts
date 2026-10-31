import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { APP_VERSION_CHECK_INTERVAL } from '../constants/app.constant'
import { logger } from '../logger'
import { PackageUtil } from '../utils/package.util'
import { Util } from '../utils/util'

const versionCheckFile = path.join(Util.getCacheDir(), 'version.json')

export const checkVersion = async () => {
  try {
    const { checkedAt } = JSON.parse(fs.readFileSync(versionCheckFile, 'utf8'))
    if (Date.now() - checkedAt < APP_VERSION_CHECK_INTERVAL) {
      return
    }
  } catch {
    // No cache file yet
  }

  try {
    const url = 'https://registry.npmjs.org/-/package/twspace-crawler/dist-tags'
    const { data } = await axios.get(url)
    const latestVersion = data.latest
    if (Util.isNewerVersion(latestVersion, PackageUtil.getVersion())) {
      logger.info(`New version: ${latestVersion}`)
      logger.info(`To update, run: npm i -g ${PackageUtil.getName()}@latest`)
    }
  } catch {
    // Ignore
  }

  try {
    fs.mkdirSync(path.dirname(versionCheckFile), { recursive: true })
    fs.writeFileSync(versionCheckFile, JSON.stringify({ checkedAt: Date.now() }))
  } catch {
    // Ignore
  }
}

import axios from 'axios'
import fs from 'fs'
import stream from 'stream'
import { promisify } from 'util'

export class Downloader {
  public static async downloadImage(url: string, filePath: string) {
    const response = await axios.get(url, { responseType: 'stream' })
    const writer = fs.createWriteStream(filePath)
    response.data.pipe(writer)
    await promisify(stream.finished)(writer)
  }
}

import { Parser } from 'm3u8-parser'

export class M3u8Util {
  public static parse(str: string) {
    const parser = new Parser()
    parser.push(str)
    parser.end()
    const { manifest } = parser
    return manifest
  }
}

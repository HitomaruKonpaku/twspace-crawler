export class BufferUtil {
  /**
   * @see https://github.com/HoloArchivists/tslazer/commit/56ba5e11cc4c1a6bab1845e835f7fc4de4babb99
   */
  public static readonly IGNORE_BUFFER = Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x50, 0x52, 0x49, 0x56])

  public static stripIgnoreBuffer(data: ArrayBuffer | Buffer) {
    const buffer = Buffer.isBuffer(data)
      ? data
      : Buffer.from(data)
    const index = buffer.indexOf(this.IGNORE_BUFFER)
    if (index === -1) {
      return buffer
    }
    return buffer.subarray(index)
  }
}

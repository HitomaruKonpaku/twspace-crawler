export class CodecUtil {
  public static isAudioCodec(codec: string) {
    return /^(?:mp4a|aac|ac-3|ec-3|ac-4|opus|flac|mp3|alac)(?:\.|$)/i.test(codec)
  }

  public static hasVideoCodec(codecs?: string) {
    return /(?:^|,\s*)(?:avc[13]|hvc1|hev1|vp0?[89]|av01)(?:\.|,|$)/i.test(codecs ?? '')
  }
}

export class ArrayUtil {
  public static splitIntoChunk<T>(array: T[], chunkSize: number) {
    const arr = Array.from(array)
    return [...Array(Math.ceil(arr.length / chunkSize))]
      .map(() => arr.splice(0, chunkSize))
  }

  public static intersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((v) => arr2.includes(v))
  }

  public static union<T>(arr1: T[], arr2: T[]): T[] {
    return [...new Set([...arr1, ...arr2])]
  }

  public static difference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((v) => !arr2.includes(v))
  }
}

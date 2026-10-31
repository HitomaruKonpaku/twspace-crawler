// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('../../package.json')

export class PackageUtil {
  public static getVersion(): string {
    return pkg.version
  }

  public static getName(): string {
    return pkg.name
  }
}

import { User, UserInput } from '../interfaces/user.interface'

export class UserUtil {
  public static dedupe(users: User[]): User[] {
    let result = users.map((v) => ({ ...v }))
    while (true) {
      const merged: User[] = []
      result.forEach((user) => {
        const found = merged.find((v) => (
          (user.id && v.id && user.id === v.id)
          || (user.username && v.username && user.username.toLowerCase() === v.username.toLowerCase())
        ))
        if (!found) {
          merged.push(user)
          return
        }
        found.id = found.id || user.id
        found.username = found.username || user.username
        found.dir = found.dir || user.dir
      })
      if (merged.length === result.length) {
        return merged
      }
      result = merged
    }
  }

  public static normalize(inputs: UserInput[]): User[] {
    const users: User[] = []
    for (const input of inputs || []) {
      const user = this.normalizeUser(input)
      if (user) {
        users.push(user)
      }
    }
    return this.dedupe(users)
  }

  private static normalizeUser(input: UserInput): User {
    if (typeof input === 'string' || typeof input === 'number') {
      const value = String(input).trim()
      if (value.startsWith(':')) {
        const id = value.substring(1).trim()
        return id
          ? { id, username: null, dir: null }
          : null
      }
      return value
        ? { id: null, username: value, dir: null }
        : null
    }
    if (!input || typeof input !== 'object') {
      return null
    }
    const id = input.id != null && String(input.id).trim()
      ? String(input.id).trim()
      : null
    const username = input.username != null && String(input.username).trim()
      ? String(input.username).trim()
      : null
    if (!id && !username) {
      return null
    }
    return { id, username, dir: input.dir || null }
  }
}

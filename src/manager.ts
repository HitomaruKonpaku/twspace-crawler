import winston from 'winston'
import { logger as baseLogger } from './logger'
import { SpaceWatcher } from './modules/SpaceWatcher'
import { UserListWatcher } from './modules/UserListWatcher'
import { UserWatcher } from './modules/UserWatcher'

class Manager {
  private logger: winston.Logger
  private userWatchers: Record<string, UserWatcher> = {}
  private spaceWatchers: Record<string, SpaceWatcher> = {}

  constructor() {
    this.logger = baseLogger.child({ label: '[Manager]' })
  }

  public addSpaceWatcher(spaceId: string, username = '') {
    const watchers = this.spaceWatchers
    if (watchers[spaceId]) {
      return
    }
    const watcher = new SpaceWatcher(spaceId, username)
    watchers[spaceId] = watcher
    watcher.watch()
    watcher.once('complete', () => {
      this.logger.debug(`SpaceWatcher@${spaceId} complete`)
      if (!watchers[spaceId]) {
        return
      }
      delete watchers[spaceId]
      this.logger.debug(`SpaceWatcher@${spaceId} delete`)
    })
  }

  public addUserWatcher(username: string) {
    const watchers = this.userWatchers
    if (watchers[username]) {
      return
    }
    const watcher = new UserWatcher(username)
    watchers[username] = watcher
    watcher.watch()
    watcher.on('data', (id) => {
      this.addSpaceWatcher(id, username)
    })
  }

  public runUserListWatcher(usernames: string[]) {
    const watcher = new UserListWatcher(usernames)
    watcher.watch()
    watcher.on('data', (id) => {
      this.addSpaceWatcher(id)
    })
  }
}

export const manager = new Manager()

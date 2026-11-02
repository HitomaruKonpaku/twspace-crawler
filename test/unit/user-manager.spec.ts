import path from 'path'
import { api } from '../../src/api/twitter.api'
import { configManager } from '../../src/modules/config-manager'
import { userManager } from '../../src/modules/user-manager'

const USER = { id: '1024532356554608640', username: 'nakiriayame' }
const OTHER_ID = '1024532356554608641'

const userResult = (username: string, id: string) => ({
  __typename: 'User',
  rest_id: id,
  legacy: { screen_name: username },
})

const unavailableResult = {
  __typename: 'UserUnavailable',
  message: 'User is age-restricted',
  reason: 'Suspended',
}

describe('UserManager', () => {
  let originalUsers: any[]
  let originalUserByScreenName: any
  let originalConfig: any
  let calls: { username: string, useAuth: boolean }[]

  beforeEach(() => {
    originalUsers = (userManager as any).users
    originalUserByScreenName = (api.graphql as any).UserByScreenName
    originalConfig = configManager.config
    calls = []
  })

  afterEach(() => {
    (userManager as any).users = originalUsers
    const graphql = api.graphql as any
    graphql.UserByScreenName = originalUserByScreenName
    configManager.config = originalConfig
  })

  describe('getUserByUsername', () => {
    it('skips entries without a username', () => {
      (userManager as any).users = [
        { id: USER.id, username: null },
        { id: null, username: USER.username },
      ]

      expect(userManager.getUserByUsername(USER.username))
        .toEqual({ id: null, username: USER.username })
    })
  })

  describe('getDownloadDir', () => {
    const absoluteDir = path.join(path.parse(process.cwd()).root, 'absolute', 'user')

    it('returns the custom dir with the username', () => {
      (userManager as any).users = [{ ...USER, dir: 'custom' }]

      expect(userManager.getDownloadDir(USER.id, USER.username))
        .toBe(path.join(path.resolve('custom'), USER.username))
    })

    it('returns an absolute user dir as is', () => {
      (userManager as any).users = [{ ...USER, dir: absoluteDir }]

      expect(userManager.getDownloadDir(USER.id, USER.username))
        .toBe(path.join(absoluteDir, USER.username))
    })

    it('prefers the user dir over downloadDir', () => {
      (userManager as any).users = [{ ...USER, dir: 'user-dir' }]
      configManager.config = { downloadDir: 'global-dir' }

      expect(userManager.getDownloadDir(USER.id, USER.username))
        .toBe(path.join(path.resolve('user-dir'), USER.username))
    })

    it('uses the user found by id before the user found by username', () => {
      (userManager as any).users = [
        { ...USER, dir: 'id-dir' },
        { id: OTHER_ID, username: USER.username, dir: 'username-dir' },
      ]

      expect(userManager.getDownloadDir(USER.id, USER.username))
        .toBe(path.join(path.resolve('id-dir'), USER.username))
    })

    it('matches by username when the id is not in the list', () => {
      (userManager as any).users = [{ id: null, username: USER.username, dir: 'custom' }]

      expect(userManager.getDownloadDir(OTHER_ID, USER.username))
        .toBe(path.join(path.resolve('custom'), USER.username))
    })

    it('matches the username ignoring case', () => {
      (userManager as any).users = [{ id: null, username: USER.username.toUpperCase(), dir: 'custom' }]

      expect(userManager.getDownloadDir(OTHER_ID, USER.username))
        .toBe(path.join(path.resolve('custom'), USER.username))
    })

    it('matches by username when the creator id is empty', () => {
      (userManager as any).users = [{ ...USER, dir: 'custom' }]

      expect(userManager.getDownloadDir('', USER.username))
        .toBe(path.join(path.resolve('custom'), USER.username))
    })

    it('uses downloadDir when the user has no dir', () => {
      (userManager as any).users = [{ ...USER }]
      configManager.config = { downloadDir: 'global-dir' }

      expect(userManager.getDownloadDir(USER.id, USER.username))
        .toBe(path.join(path.resolve('global-dir'), USER.username))
    })

    it('uses downloadDir when the user is not in the list', () => {
      (userManager as any).users = []
      configManager.config = { downloadDir: 'global-dir' }

      expect(userManager.getDownloadDir(OTHER_ID, USER.username))
        .toBe(path.join(path.resolve('global-dir'), USER.username))
    })

    it('returns an absolute downloadDir as is', () => {
      (userManager as any).users = [{ ...USER }]
      configManager.config = { downloadDir: absoluteDir }

      expect(userManager.getDownloadDir(USER.id, USER.username))
        .toBe(path.join(absoluteDir, USER.username))
    })

    it('returns undefined when the user has no dir and there is no downloadDir', () => {
      (userManager as any).users = [{ ...USER }]
      configManager.config = {}

      expect(userManager.getDownloadDir(USER.id, USER.username)).toBeUndefined()
    })

    it('returns undefined when the user is not in the list and there is no downloadDir', () => {
      (userManager as any).users = []
      configManager.config = {}

      expect(userManager.getDownloadDir(OTHER_ID, USER.username)).toBeUndefined()
    })

    it('returns undefined when the username is empty', () => {
      (userManager as any).users = [{ ...USER, dir: 'custom' }]
      configManager.config = { downloadDir: 'global-dir' }

      expect(userManager.getDownloadDir(USER.id, '')).toBeUndefined()
    })
  })

  describe('updateUserIds', () => {
    const participant = (id = USER.id, username = USER.username): any => ({
      user_results: {
        rest_id: id,
        result: { rest_id: id, legacy: { screen_name: username } },
      },
      twitter_screen_name: username,
    })

    it('sets the id from an admin', () => {
      (userManager as any).users = [{ id: null, username: USER.username }]

      userManager.updateUserIds({
        total: 1,
        admins: [participant()],
        speakers: [],
        listeners: [],
      })

      expect(userManager.getUsers()).toEqual([{ id: USER.id, username: USER.username }])
    })

    it('sets the id from a speaker', () => {
      (userManager as any).users = [{ id: null, username: USER.username }]

      userManager.updateUserIds({
        total: 1,
        admins: [],
        speakers: [participant()],
        listeners: [],
      })

      expect(userManager.getUsers()).toEqual([{ id: USER.id, username: USER.username }])
    })

    it('sets the id from a listener', () => {
      (userManager as any).users = [{ id: null, username: USER.username }]

      userManager.updateUserIds({
        total: 1,
        admins: [],
        speakers: [],
        listeners: [participant()],
      })

      expect(userManager.getUsers()).toEqual([{ id: USER.id, username: USER.username }])
    })

    it('does not overwrite an existing id', () => {
      (userManager as any).users = [{ ...USER }]

      userManager.updateUserIds({
        total: 1,
        admins: [participant(OTHER_ID)],
        speakers: [],
        listeners: [],
      })

      expect(userManager.getUserById(USER.id)).toBeDefined()
      expect(userManager.getUserById(OTHER_ID)).toBeUndefined()
    })

    it('merges an id-only entry with a username-only entry after the id is found', () => {
      (userManager as any).users = [
        { id: USER.id, username: null },
        { id: null, username: USER.username },
      ]

      userManager.updateUserIds({
        total: 1,
        admins: [participant()],
        speakers: [],
        listeners: [],
      })

      expect(userManager.getUsers()).toEqual([{ id: USER.id, username: USER.username }])
    })

    it('ignores participants that are not in the list', () => {
      (userManager as any).users = []

      userManager.updateUserIds({
        total: 1,
        admins: [participant()],
        speakers: [],
        listeners: [],
      })

      expect(userManager.getUsers()).toEqual([])
    })
  })

  describe('getUserByScreenName', () => {
    const mockUserByScreenName = (handler: (username: string, useAuth: boolean) => any) => {
      (api.graphql as any).UserByScreenName = async (username: string, useAuth = false) => {
        calls.push({ username, useAuth })
        return { data: { data: { user: { result: handler(username, useAuth) } } } }
      }
    }

    const getUserByScreenName = (username: string) => (userManager as any).getUserByScreenName(username)

    it('returns the user from the public call', async () => {
      (userManager as any).users = [{ id: null, username: USER.username }]
      mockUserByScreenName(() => userResult(USER.username, USER.id))

      const user = await getUserByScreenName(USER.username)

      expect(user).toEqual(USER)
      expect(calls).toEqual([{ username: USER.username, useAuth: false }])
      expect(userManager.getUserByUsername(USER.username)).toBeDefined()
    })

    it('retries with auth when the user is unavailable and returns the user', async () => {
      (userManager as any).users = [{ id: null, username: USER.username }]
      mockUserByScreenName((username, useAuth) => (
        useAuth
          ? userResult(USER.username, USER.id)
          : unavailableResult
      ))

      const user = await getUserByScreenName(USER.username)

      expect(user).toEqual(USER)
      expect(calls).toEqual([
        { username: USER.username, useAuth: false },
        { username: USER.username, useAuth: true },
      ])
      expect(userManager.getUserByUsername(USER.username)).toBeDefined()
    })

    it('removes the user when the auth retry is still unavailable', async () => {
      (userManager as any).users = [{ id: null, username: USER.username }]
      mockUserByScreenName(() => unavailableResult)

      const user = await getUserByScreenName(USER.username)

      expect(user).toBeNull()
      expect(calls).toEqual([
        { username: USER.username, useAuth: false },
        { username: USER.username, useAuth: true },
      ])
      expect(userManager.getUserByUsername(USER.username)).toBeUndefined()
    })

    it('removes the user when the public call is unavailable and the retry has no user', async () => {
      (userManager as any).users = [{ id: null, username: USER.username }]
      mockUserByScreenName((username, useAuth) => (useAuth ? null : unavailableResult))

      const user = await getUserByScreenName(USER.username)

      expect(user).toBeNull()
      expect(userManager.getUserByUsername(USER.username)).toBeUndefined()
    })

    it('keeps the user when the public call has no user and is not unavailable', async () => {
      (userManager as any).users = [{ id: null, username: USER.username }]
      mockUserByScreenName(() => null)

      const user = await getUserByScreenName(USER.username)

      expect(user).toBeNull()
      expect(calls).toEqual([{ username: USER.username, useAuth: false }])
      expect(userManager.getUserByUsername(USER.username)).toBeDefined()
    })
  })
})

import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import { api } from '../../src/api/twitter.api'
import { userManager } from '../../src/modules/user-manager'

const lab = Lab.script()
const { describe, it, beforeEach, afterEach } = lab
export { lab }

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
  let calls: { username: string, useAuth: boolean }[]

  beforeEach(() => {
    originalUsers = (userManager as any).users
    originalUserByScreenName = (api.graphql as any).UserByScreenName
    calls = []
  })

  afterEach(() => {
    (userManager as any).users = originalUsers
    ;(api.graphql as any).UserByScreenName = originalUserByScreenName
  })

  const mockUserByScreenName = (handler: (username: string, useAuth: boolean) => any) => {
    (api.graphql as any).UserByScreenName = async (username: string, useAuth = false) => {
      calls.push({ username, useAuth })
      return { data: { data: { user: { result: handler(username, useAuth) } } } }
    }
  }

  const getUserByScreenName = (username: string) => (userManager as any).getUserByScreenName(username)

  describe('getUserByScreenName', () => {
    it('returns the user from the public call', async () => {
      (userManager as any).users = [{ id: null, username: 'alice' }]
      mockUserByScreenName(() => userResult('alice', '1'))

      const user = await getUserByScreenName('alice')

      expect(user).equal({ id: '1', username: 'alice' })
      expect(calls).equal([{ username: 'alice', useAuth: false }])
      expect(userManager.getUserByUsername('alice')).exist()
    })

    it('retries with auth when the user is unavailable and returns the user', async () => {
      (userManager as any).users = [{ id: null, username: 'alice' }]
      mockUserByScreenName((username, useAuth) => (useAuth ? userResult('alice', '1') : unavailableResult))

      const user = await getUserByScreenName('alice')

      expect(user).equal({ id: '1', username: 'alice' })
      expect(calls).equal([
        { username: 'alice', useAuth: false },
        { username: 'alice', useAuth: true },
      ])
      expect(userManager.getUserByUsername('alice')).exist()
    })

    it('removes the user when the auth retry is still unavailable', async () => {
      (userManager as any).users = [{ id: null, username: 'alice' }]
      mockUserByScreenName(() => unavailableResult)

      const user = await getUserByScreenName('alice')

      expect(user).null()
      expect(calls).equal([
        { username: 'alice', useAuth: false },
        { username: 'alice', useAuth: true },
      ])
      expect(userManager.getUserByUsername('alice')).not.exist()
    })

    it('removes the user when the public call is unavailable and the retry has no user', async () => {
      (userManager as any).users = [{ id: null, username: 'alice' }]
      mockUserByScreenName((username, useAuth) => (useAuth ? null : unavailableResult))

      const user = await getUserByScreenName('alice')

      expect(user).null()
      expect(userManager.getUserByUsername('alice')).not.exist()
    })

    it('keeps the user when the public call has no user and is not unavailable', async () => {
      (userManager as any).users = [{ id: null, username: 'alice' }]
      mockUserByScreenName(() => null)

      const user = await getUserByScreenName('alice')

      expect(user).null()
      expect(calls).equal([{ username: 'alice', useAuth: false }])
      expect(userManager.getUserByUsername('alice')).exist()
    })
  })
})

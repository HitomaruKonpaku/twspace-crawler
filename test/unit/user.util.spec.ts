import { UserUtil } from '../../src/utils/user.util'

const USER = { id: '1024532356554608640', username: 'nakiriayame' }

describe('UserUtil', () => {
  describe('dedupe', () => {
    it('keeps the username and dir from the duplicate entries', () => {
      expect(UserUtil.dedupe([
        { id: USER.id, username: null, dir: 'D:\\spaces' },
        { id: USER.id, username: USER.username, dir: null },
      ])).toEqual([{ id: USER.id, username: USER.username, dir: 'D:\\spaces' }])
    })
  })

  describe('normalize', () => {
    it('reads a string as a username', () => {
      expect(UserUtil.normalize([USER.username]))
        .toEqual([{ id: null, username: USER.username, dir: null }])
    })

    it('reads a number as a username', () => {
      expect(UserUtil.normalize([123123])).toEqual([{ id: null, username: '123123', dir: null }])
    })

    it('reads the colon prefix as an id', () => {
      expect(UserUtil.normalize([`:${USER.id}`]))
        .toEqual([{ id: USER.id, username: null, dir: null }])
    })

    it('reads an object with id, username, and dir', () => {
      expect(UserUtil.normalize([{ ...USER, dir: 'D:\\spaces' }]))
        .toEqual([{ id: USER.id, username: USER.username, dir: 'D:\\spaces' }])
    })

    it('ignores an object without id and username', () => {
      expect(UserUtil.normalize([{ dir: 'D:\\spaces' } as any])).toEqual([])
    })

    it('merges entries with the same id and keeps the username', () => {
      expect(UserUtil.normalize([
        { id: USER.id },
        { id: USER.id, username: USER.username },
      ])).toEqual([{ id: USER.id, username: USER.username, dir: null }])
    })

    it('merges entries with the same username, ignoring case', () => {
      expect(UserUtil.normalize([
        { username: 'NakiriAyame' },
        { id: USER.id, username: USER.username },
      ])).toEqual([{ id: USER.id, username: 'NakiriAyame', dir: null }])
    })

    it('merges all shorthand and object forms of the same user', () => {
      expect(UserUtil.normalize([
        USER.username,
        `:${USER.id}`,
        { id: USER.id, username: USER.username, dir: 'D:\\spaces' },
        { username: USER.username, dir: '/mnt/spaces' },
      ])).toEqual([{ id: USER.id, username: USER.username, dir: 'D:\\spaces' }])
    })
  })
})

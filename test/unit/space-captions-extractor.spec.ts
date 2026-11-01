import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { SpaceCaptionsDownloaderResult } from '../../src/interfaces/space-captions.interface'
import { SpaceCaptionsExtractor } from '../../src/modules/space-captions-extractor'

const lab = Lab.script()
const { describe, it, after } = lab
export { lab }

describe('SpaceCaptionsExtractor', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'space-captions-'))
  const fixtureDir = path.join(__dirname, '../data/live-chat')
  const primaryFile = path.join(fixtureDir, '1AxRnZrRBkgxl.json')
  const multiUserFile = path.join(fixtureDir, '1pJdRDXgAAqKW.json')

  after(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  const loadFixture = (file = primaryFile) => JSON.parse(fs.readFileSync(file, 'utf8')) as SpaceCaptionsDownloaderResult

  const writeFixture = (name: string, data: SpaceCaptionsDownloaderResult) => {
    const inpFile = path.join(dir, `${name} CC.json`)
    fs.writeFileSync(inpFile, JSON.stringify(data))
    return inpFile
  }

  const extract = (name: string, data: SpaceCaptionsDownloaderResult) => {
    const inpFile = writeFixture(name, data)
    new SpaceCaptionsExtractor({ inpFile }).extract()
    const content = fs.readFileSync(`${inpFile}.txt`, 'utf8')
    return content
  }

  // constructor / outFile

  it('uses a custom outFile and creates its parent folder', () => {
    const inpFile = writeFixture('custom', loadFixture())
    const outFile = path.join(dir, 'nested', 'out.txt')
    new SpaceCaptionsExtractor({ inpFile, outFile }).extract()
    expect(fs.readFileSync(outFile, 'utf8').split('\n')[0]).equal('00:02:25 | mizumiya_su: どうぞ')
    expect(fs.existsSync(`${inpFile}.txt`)).false()
  })

  it('appends .txt when outFile equals inpFile', () => {
    const inpFile = writeFixture('same', loadFixture())
    new SpaceCaptionsExtractor({ inpFile, outFile: inpFile }).extract()
    expect(fs.existsSync(`${inpFile}.txt`)).true()
  })

  // extract / loadFile

  it('does not throw when the input file is missing', () => {
    const inpFile = path.join(dir, 'missing CC.json')
    expect(() => new SpaceCaptionsExtractor({ inpFile }).extract()).not.throw()
  })

  // buildContent / addUsers

  it('extracts chatType 45 messages with time and mapped username', () => {
    const content = extract('primary', loadFixture())
    const lines = content.split('\n').filter(Boolean)
    expect(lines.length).equal(169)
    expect(lines[0]).equal('00:02:25 | mizumiya_su: どうぞ')
    expect(lines[lines.length - 1]).equal('00:30:03 | mizumiya_su: これ スペースてどうやって終わるんだっけよいしょ じゃあね あ ロープ ちょっと遅れるかも')
  })

  it('maps multiple users including extra users', () => {
    const content = extract('multi', loadFixture(multiUserFile))
    const lines = content.split('\n').filter(Boolean)
    expect(lines.length).equal(559)
    expect(lines[0]).equal("00:01:00 | ourokronii: hello everyone how's it going how is it going everyone")
    expect(lines).contain('01:03:43 | raorapanthera: what')
    expect(lines[lines.length - 1]).equal('01:11:58 | ourokronii: okay bye bye')
    expect(content).not.contain('[1775407762673168384]')
  })

  it('shows [userId] when a user is missing from extraUsers', () => {
    const data = loadFixture(multiUserFile)
    delete data.metadata.extraUsers
    const content = extract('multi without extra users', data)
    const lines = content.split('\n').filter(Boolean)
    expect(lines.length).equal(559)
    expect(lines[0]).equal("00:01:00 | ourokronii: hello everyone how's it going how is it going everyone")
    expect(lines).contain('01:03:43 | [1775407762673168384]: what')
    expect(content).not.contain('raorapanthera')
  })

  it('maps a user from periscope_user_id when rest_id is missing', () => {
    const data = loadFixture()
    const host = data.metadata.audioSpace!.participants!.admins[0]
    host.periscope_user_id = 'tw-1818941599789035520'
    delete (host.user_results as unknown as Record<string, unknown>).rest_id
    const content = extract('periscope id', data)
    expect(content.split('\n')[0]).equal('00:02:25 | mizumiya_su: どうぞ')
  })

  it('falls back to [userId] when the user is not mapped', () => {
    const data = loadFixture()
    delete data.metadata.audioSpace!.participants
    const content = extract('no participants', data)
    expect(content.split('\n')[0]).equal('00:02:25 | [1818941599789035520]: どうぞ')
  })

  it('falls back to [userId] when the mapped user has no screen name', () => {
    const data = loadFixture()
    delete (data.metadata.audioSpace!.participants!.admins[0] as Record<string, unknown>).twitter_screen_name
    const content = extract('no screen name', data)
    expect(content.split('\n')[0]).equal('00:02:25 | [1818941599789035520]: どうぞ')
  })

  it('does not override a participant with an extra user', () => {
    const data = loadFixture(multiUserFile)
    data.metadata.extraUsers!.push({ id: '1409817096523968513', username: 'other' })
    const content = extract('extra user override', data)
    expect(content.split('\n')[0]).equal("00:01:00 | ourokronii: hello everyone how's it going how is it going everyone")
  })

  // buildContent / filterChats

  it('drops chats that are not chatType 45 or have no message', () => {
    const data = loadFixture()
    data.chats = [
      { ts: '1791437093507000000', chatType: 2, userId: '1818941599789035520', message: 'typed' },
      { ts: '1791437093507000000', chatType: 45, userId: '1818941599789035520' },
      { ts: '1791437093507000000', chatType: 45, userId: '1818941599789035520', message: ' kept ' },
    ]
    expect(extract('filter', data)).equal('00:02:25 | mizumiya_su: kept\n')
  })

  // buildContent / buildLine / getTime

  it('omits the time prefix when started_at is missing', () => {
    const data = loadFixture()
    delete data.metadata.audioSpace!.metadata.started_at
    const content = extract('no time', data)
    expect(content.split('\n')[0]).equal('mizumiya_su: どうぞ')
  })

  it('clamps time to 00:00:00 when a chat starts before started_at', () => {
    const data = loadFixture()
    data.chats = [{ ts: '1000000000', chatType: 45, userId: '1818941599789035520', message: 'early' }]
    expect(extract('early', data)).equal('00:00:00 | mizumiya_su: early\n')
  })

  // extract / saveFile

  it('writes an empty file when no chat matches', () => {
    const data = loadFixture()
    data.chats = data.chats.filter((v) => v.chatType !== 45)
    expect(extract('empty', data)).equal('')
  })
})

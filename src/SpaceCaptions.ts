import axios from 'axios'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import winston from 'winston'
import { WebSocket } from 'ws'
import { SpaceCaptionsOptions } from './interfaces/SpaceCaptionsOptions.interface'
import { logger as baseLogger } from './logger'
import { Periscope } from './namespaces/Periscope'
import { Twitter } from './namespaces/Twitter'
import { Util } from './Util'

export class SpaceCaptions {
  private readonly WS_URL = 'wss://prod-chatman-ancillary-ap-northeast-1.pscp.tv/chatapi/v1/chatnow'
  private readonly CHAT_API_URL = 'https://proxsee.pscp.tv/api/v2/accessChatPublic'

  private logger: winston.Logger
  private ws: WebSocket
  private accessChatData: Periscope.AccessChat

  private tmpChatFile: string
  private outChatFile: string

  constructor(
    public spaceId: string,
    private liveStreamStatus: Twitter.LiveVideoStreamStatus,
    private options: SpaceCaptionsOptions,
  ) {
    this.logger = baseLogger.child({ label: `[SpaceCaptions@${spaceId}]` })

    this.tmpChatFile = path.join(Util.getMediaDir(this.username), `${this.filename} Chat.jsonl`)
    this.outChatFile = path.join(Util.getMediaDir(this.username), `${this.filename} Chat.txt`)

    Util.createMediaDir(this.username)
    this.logger.info(`Tmp chat file ${this.tmpChatFile}`)
    this.logger.info(`Out chat file ${this.outChatFile}`)
  }

  private get chatToken(): string {
    return this.liveStreamStatus.chatToken
  }

  private get username(): string {
    return this.options.username || ''
  }

  private get filename(): string {
    return this.options.filename
  }

  public async watch() {
    if (!this.chatToken) {
      this.logger.warn('Chat token not found!')
      return
    }
    try {
      await this.getAccessChatData()
      this.initWs()
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  public unwatch() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(0, 'Complete!')
    }
  }

  private async getAccessChatData() {
    const { data } = await axios.post(this.CHAT_API_URL, { chat_token: this.chatToken })
    this.logger.debug('accessChat data', data)
    this.accessChatData = data
  }

  private initWs() {
    this.ws = new WebSocket(this.WS_URL, {})
    this.setupWsEventHandlers()
  }

  private setupWsEventHandlers() {
    const { ws } = this
    ws.on('error', (error) => {
      this.logger.error(`[WS] Error: ${error.message}`)
    })
    ws.on('close', (code, reason) => {
      this.logger.info(`[WS] Close with code: ${code}, reason: ${reason.toString('utf-8') || 'not found'}`)
      this.writeOutChatFile()
    })
    ws.on('open', () => {
      this.logger.info('[WS] Open')
      const authPayload = JSON.stringify({
        kind: Periscope.MessageKind.AUTH,
        payload: JSON.stringify({ access_token: this.accessChatData.access_token }),
      })
      const controlPayload = JSON.stringify({
        kind: Periscope.MessageKind.CONTROL,
        payload: JSON.stringify({
          kind: 1,
          body: JSON.stringify({ room: this.spaceId }),
        }),
      })
      this.logger.debug(authPayload)
      this.logger.debug(controlPayload)
      ws.send(authPayload)
      ws.send(controlPayload)
    })
    ws.on('message', (data) => {
      const payload = `${data.toString('utf-8')}\n`
      fs.appendFileSync(this.tmpChatFile, payload)
    })
  }

  private async writeOutChatFile() {
    this.logger.silly('writeOutChatFile')
    try {
      if (!fs.existsSync(this.tmpChatFile)) {
        this.logger.warn(`Tmp chat file not found at ${this.tmpChatFile}`)
        return
      }
      this.logger.info(`Writing chat to ${this.outChatFile}`)
      fs.writeFileSync(this.outChatFile, '')
      await this.processTmpChatFile()
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  private async processTmpChatFile() {
    this.logger.silly('processTmpChatFile')
    const fileStream = fs.createReadStream(this.tmpChatFile)
    const rl = readline.createInterface({ input: fileStream })
    let lineCount = 0
    // eslint-disable-next-line no-restricted-syntax
    for await (const line of rl) {
      lineCount += 1
      try {
        this.processTmpChatLine(line)
      } catch (error) {
        this.logger.error(`Failed to process line ${lineCount}: ${error.message}`)
      }
    }
    this.logger.info(`Chat saved to ${this.outChatFile}`)
  }

  private processTmpChatLine(payload: string) {
    const obj = JSON.parse(payload)
    if (obj.kind !== Periscope.MessageKind.CHAT) {
      return
    }
    this.processChat(obj.payload)
  }

  private processChat(payload: string) {
    const obj = JSON.parse(payload)
    if (!obj.uuid) {
      return
    }
    this.processChatBody(obj.body)
  }

  private processChatBody(payload: string) {
    const obj = JSON.parse(payload)
    if (!obj.final || !obj.body) {
      return
    }
    const msg = `${obj.username}: ${obj.body}\n`
    fs.appendFileSync(this.outChatFile, msg)
  }
}

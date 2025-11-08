import Bottleneck from 'bottleneck'
import { ClientTransaction, handleXMigration } from 'x-client-transaction-id'
import { logger } from '../logger'

/**
 * @see https://github.com/Lqm1/x-client-transaction-id
 * @since 2025-11-08
 */
export class TwitterTransaction {
  private readonly logger = logger.child({ label: '[TwitterTransaction]' })

  private readonly ids: Record<string, Record<string, string>> = {}

  private readonly clientLimiter = new Bottleneck({ maxConcurrent: 1 })
  private readonly transactionLimiter = new Bottleneck({ maxConcurrent: 1 })

  private transaction: ClientTransaction

  public async generateTransactionId(method: string, path: string) {
    // eslint-disable-next-line no-param-reassign
    method = method.toUpperCase()
    const res = await this.transactionLimiter.schedule(async () => {
      let transactionId = this.ids[path]?.[method]
      if (transactionId) {
        return transactionId
      }
      const transaction = await this.initClient()
      transactionId = await transaction.generateTransactionId(method, path)
      this.logger.info(`generateTransactionId | ${JSON.stringify({ method, path, transactionId })}`)
      this.ids[path] = { [method]: transactionId }
      return transactionId
    })
    return res
  }

  private async initClient() {
    const res = await this.clientLimiter.schedule(async () => {
      if (!this.transaction) {
        this.logger.info('initClient: create')
        const document = await handleXMigration()
        const transaction = await ClientTransaction.create(document)
        this.transaction = transaction
        this.logger.info('initClient: ok')
      }
      return this.transaction
    })
    return res
  }
}

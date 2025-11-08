import Bottleneck from 'bottleneck'
import { ClientTransaction, handleXMigration } from 'x-client-transaction-id'
import { logger } from '../logger'

interface TransactionItem {
  value: string
  at: number
}

/**
 * @see https://github.com/Lqm1/x-client-transaction-id
 * @since 2025-11-08
 */
export class TwitterTransaction {
  private readonly logger = logger.child({ label: '[TwitterTransaction]' })

  private readonly ttl = 1000

  private readonly transactionCollections: Record<string, Record<string, TransactionItem>> = {}

  private readonly clientLimiter = new Bottleneck({ maxConcurrent: 1 })
  private readonly transactionLimiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: this.ttl,
  })

  private transaction: ClientTransaction

  public async generateTransactionId(method: string, path: string): Promise<string> {
    // eslint-disable-next-line no-param-reassign
    method = method.toUpperCase()

    const res = await this.transactionLimiter.schedule(async () => {
      let transactionItem = this.transactionCollections[path]?.[method]
      if (transactionItem && Date.now() - transactionItem.at < this.ttl) {
        return transactionItem.value
      }

      const transaction = await this.initClient()
      const transactionId = await transaction.generateTransactionId(method, path)
      transactionItem = {
        value: transactionId,
        at: Date.now(),
      }
      this.logger.debug(`generateTransactionId | ${JSON.stringify({ method, path, transactionItem })}`)
      this.transactionCollections[path] = { [method]: transactionItem }
      return transactionItem.value
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

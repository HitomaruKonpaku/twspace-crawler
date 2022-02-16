import { Command } from 'commander'
import { SpaceCaptionsDownloader } from '../modules/SpaceCaptionsDownloader'
import { SpaceCaptionsExtractor } from '../modules/SpaceCaptionsExtractor'
import { CommandUtil } from '../utils/CommandUtil'

const command = new Command('cc')
  .description('Process captions')

command
  .command('download <SPACE_ID> <ENDPOINT> <TOKEN>')
  .alias('d')
  .description('Download Space captions')
  .action((spaceId, endpoint, token, opts, cmd: Command) => {
    CommandUtil.detectDebugOption(cmd.parent.parent)
    new SpaceCaptionsDownloader(spaceId, endpoint, token).download()
  })

command
  .command('extract <FILE> [STARTED_AT]')
  .alias('e')
  .description('Extract Space captions')
  .action((file, startedAt, opts, cmd: Command) => {
    CommandUtil.detectDebugOption(cmd.parent.parent)
    new SpaceCaptionsExtractor(file, null, startedAt).extract()
  })

export { command as ccCommand }

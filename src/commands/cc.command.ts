import { Command } from 'commander'
import { SpaceCaptionsDownloader } from '../modules/space-captions-downloader'
import { SpaceCaptionsExtractor } from '../modules/space-captions-extractor'
import { CommandUtil } from '../utils/command.util'

const command = new Command('cc')
  .description('Process captions')

command
  .command('download <SPACE_ID>')
  .alias('d')
  .description('Download Space captions')
  .action((spaceId, opts, cmd: Command) => {
    CommandUtil.detectDebugOption(cmd.parent.parent)
    new SpaceCaptionsDownloader({ spaceId }).download()
  })

command
  .command('extract <FILE>')
  .alias('e')
  .description('Extract Space captions')
  .action((file, opts, cmd: Command) => {
    CommandUtil.detectDebugOption(cmd.parent.parent)
    new SpaceCaptionsExtractor({ inpFile: file }).extract()
  })

export { command as ccCommand }

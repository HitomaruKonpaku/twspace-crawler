import { Command } from 'commander'
import { SpaceCaptionsDownloader } from '../SpaceCaptionsDownloader'
import { SpaceCaptionsExtractor } from '../SpaceCaptionsExtractor'

const command = new Command('cc')
  .description('Process captions')

command
  .command('download <SPACE_ID> <TOKEN>')
  .alias('d')
  .description('Download Space captions')
  .action((spaceId, token) => {
    new SpaceCaptionsDownloader(spaceId, token).download()
  })

command
  .command('extract <FILE>')
  .alias('e')
  .description('Extract Space captions')
  .action((file) => {
    new SpaceCaptionsExtractor(file).extract()
  })

export { command as ccCommand }

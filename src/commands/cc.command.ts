import { Command } from 'commander'
import { SpaceCaptionsDownloader } from '../modules/SpaceCaptionsDownloader'
import { SpaceCaptionsExtractor } from '../modules/SpaceCaptionsExtractor'

const command = new Command('cc')
  .description('Process captions')

command
  .command('download <SPACE_ID> <ENDPOINT> <TOKEN>')
  .alias('d')
  .description('Download Space captions')
  .action((spaceId, endpoint, token) => {
    new SpaceCaptionsDownloader(spaceId, endpoint, token).download()
  })

command
  .command('extract <FILE>')
  .alias('e')
  .description('Extract Space captions')
  .action((file) => {
    new SpaceCaptionsExtractor(file).extract()
  })

export { command as ccCommand }

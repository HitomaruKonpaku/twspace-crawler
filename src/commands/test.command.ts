import { Command } from 'commander'
import { readFileSync } from 'fs'
import path from 'path'
import { SpaceDownloader } from '../modules/SpaceDownloader'
import { Util } from '../utils/Util'

const command = new Command('test')
  .description('Test!')

command
  .command('download <SPACE_IDS>')
  .alias('d')
  .description('Test download space by id(s)')
  .action((ids: string) => {
    const spaces = Array
      // eslint-disable-next-line no-eval
      .from<any>(eval(readFileSync(path.join(__dirname, '../../test/data/spaces.ts'), { encoding: 'utf8' })))
      .filter((space) => space.playlist_url)

    const spaceIds = ids.split(',').filter((v) => v)
    const filteredSpaces = spaces.filter((v) => spaceIds.some((id) => id === v.id))

    if (!filteredSpaces.length) {
      // eslint-disable-next-line no-console
      console.debug('No space(s) found')
      return
    }

    const users = Array
      // eslint-disable-next-line no-eval
      .from<any>(eval(readFileSync(path.join(__dirname, '../../test/data/users.ts'), { encoding: 'utf8' })))

    filteredSpaces.forEach((space) => {
      const user = users.find((v) => v.username === space.username)
      const time = Util.getDateTimeString(space.started_at)
      const name = `[${space.username}][${time}] ${space.title || 'NA'} (${space.id})`
      const metadata = {
        title: space.title,
        author: user.name,
        artist: user.name,
        episode_id: space.id,
      }
      new SpaceDownloader(
        space.playlist_url,
        name,
        space.username,
        metadata,
      ).download()
    })
  })

export { command as testCommand }

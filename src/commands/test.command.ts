import { Command } from 'commander'

const command = new Command('test')
  .description('Test!')
  .action(() => {
    console.debug('Test!')
  })

export { command as testCommand }

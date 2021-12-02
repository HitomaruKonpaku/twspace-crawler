import { program } from 'commander'

program
  .version('1.4.3')
  .description('Script to crawl & download Twitter Spaces.')
  .option('-d, --debug', 'Show debug logs')
  .option('--config <CONFIG_PATH>', 'Load config file (Check config.json)')
  .option('--user <USER>', 'Watch & download live Spaces from users, separate by comma (,)')
  .option('--id <SPACE_ID>', 'Watch & download live Space with id')
  .option('--force', 'Force download Space when using with --id')
  .option('--url <PLAYLIST_ID>', 'Download Space using playlist url')
  .option('--notification', 'Show notification about new live Space')
  .option('--extract-cc <FILE_PATH>', 'Extract captions from jsonl file and exit')
  .parse()

export { program }

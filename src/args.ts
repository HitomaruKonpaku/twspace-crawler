import minimist from 'minimist'
import { AppArgs } from './interfaces/app-args.interface'

export const args = minimist<AppArgs>(process.argv.slice(2))

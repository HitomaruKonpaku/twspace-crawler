import minimist from 'minimist'
import { AppArgs } from './interfaces/AppArgs.interface'

export const args = minimist<AppArgs>(process.argv.slice(2))

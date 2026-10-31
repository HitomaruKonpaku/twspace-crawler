import { Command } from 'commander'
import { toggleDebugConsole } from '../logger'

export class CommandUtil {
  public static detectDebugOption(cmd: Command) {
    if (!cmd.getOptionValue('debug')) {
      return
    }
    toggleDebugConsole()
  }
}

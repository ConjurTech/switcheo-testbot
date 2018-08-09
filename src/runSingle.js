import { cloneDeep } from 'lodash'
import { actPrinter } from './utils'
import * as act from './lib'

const enabledCommands = c => c.run

const runSingle = async (switcheo, accounts, commands) => {
  const account = accounts[0]

  commands.filter(enabledCommands).forEach(async (command) => {
    const { type, action, params = [], options = {} } = cloneDeep(command)
    const res = await act[type][action]({ switcheo, account }, ...params, options)
    if (options && options.print) {
      actPrinter(type, action, options, res)
    }
  })
}

export default runSingle

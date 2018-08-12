import { CONTRACT_HASH } from '../../constants'

const list = async ({ switcheo, account }) =>
  switcheo.listBalances({ addresses: [account.scriptHash], contractHashes: [CONTRACT_HASH] })

export { list }

const list = async ({ switcheo, account }) =>
  switcheo.listBalances(account)

export { list }

const list = async ({ switcheo, account }) =>
  switcheo.getBalances(account)

export { list }

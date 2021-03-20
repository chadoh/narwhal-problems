export const formatLargeNum = (n: number) =>
  new Intl.NumberFormat(undefined).format(n)

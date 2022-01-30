/**
 * Convert machine-readable yoctoNEAR to human-readable NEAR.
 *
 * @param yoctoNear number of yoctoNEAR to convert to NEAR tokens
 * @returns
 */
export function toNear(yoctoNear: number | string): number {
  return Number(yoctoNear) / 1e24;
}

export const formatLargeNum = (n: number, { convertYocto = true } = {}) =>
  convertYocto
    ? new Intl.NumberFormat(undefined).format(toNear(n))
    : new Intl.NumberFormat(undefined).format(n);

const numbersOnlyRegex = /^\d*\.?\d*$/

export const isNumbersOnly = (value: string) => numbersOnlyRegex.test(value)
export const isNumbersOnlyWithNegative = (value: string) => /^-?\d*\.?\d*$/.test(value)

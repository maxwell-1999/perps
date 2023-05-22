export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export function sum(values: bigint[]) {
  return values.reduce((sum, value) => sum + value, 0n);
}

export function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

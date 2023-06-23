import { Abi, AbiFunction, AbiParameter, AbiParametersToPrimitiveTypes, ExtractAbiFunction } from 'abitype'

// Taken from ABIType Examples: https://github.com/wagmi-dev/abitype/blob/main/examples/types.ts
export type ContractReturnType<
  abi extends Abi = Abi,
  functionName extends string = string,
  args extends readonly unknown[] | undefined = readonly unknown[] | undefined,
  ///
  abiFunction extends AbiFunction = (
    abi extends Abi ? ExtractAbiFunction<abi, functionName> : AbiFunction
  ) extends infer abiFunction_ extends AbiFunction
    ? IsUnion<abiFunction_> extends true // narrow overloads by `args` by converting to tuple and filtering out overloads that don't match
      ? UnionToTuple<abiFunction_> extends infer abiFunctions extends readonly AbiFunction[]
        ? {
            [K in keyof abiFunctions]: (
              readonly unknown[] | undefined extends args // for functions that don't have inputs, `args` can be `undefined` so fallback to `readonly []`
                ? readonly []
                : args
            ) extends AbiParametersToPrimitiveTypes<abiFunctions[K]['inputs'], 'inputs'>
              ? abiFunctions[K]
              : never
          }[number] // convert back to union (removes `never` tuple entries: `['foo', never, 'bar'][number]` => `'foo' | 'bar'`)
        : never
      : abiFunction_
    : never,
  outputs extends readonly AbiParameter[] = abiFunction['outputs'],
  primitiveTypes extends readonly unknown[] = AbiParametersToPrimitiveTypes<outputs, 'outputs'>,
> = [abiFunction] extends [never]
  ? unknown // `abiFunction` was not inferrable (e.g. `abi` declared as `Abi`)
  : readonly unknown[] extends primitiveTypes
  ? unknown // `abiFunction` was not inferrable (e.g. `abi` not const-asserted)
  : primitiveTypes extends readonly [] // unwrap `primitiveTypes`
  ? void // no outputs
  : primitiveTypes extends readonly [infer primitiveType]
  ? primitiveType // single output
  : primitiveTypes

type IsUnion<T, C = T> = T extends C ? ([C] extends [T] ? false : true) : never
type UnionToTuple<U, Last = LastInUnion<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, Last>>, Last]
type LastInUnion<U> = UnionToIntersection<U extends unknown ? (x: U) => 0 : never> extends (x: infer L) => 0 ? L : never
type UnionToIntersection<U> = (U extends unknown ? (arg: U) => 0 : never) extends (arg: infer I) => 0 ? I : never

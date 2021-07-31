import { Kind } from 'fp-ts/lib/HKT'
import * as O from 'fp-ts/lib/Option'
import { ADT, match, matchI } from 'ts-adt'

export type { ADT as T }
export { match, matchI }

export const URI = 'ADT'

export type URI = typeof URI

// ADT<T extends Record<string, {}>> = { [K in keyof T]: Record<"_type", K> & T[K]; }[keyof T]

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A extends Record<string, {}>> {
    readonly ADT: ADT<A>
  }
}

export const make =
  <F extends URI, A>() =>
  <K extends keyof A>(tag: K) =>
  (data: A[K]): Kind<F, A> => ({ _tag: tag, ...data })

// export const take =
//   <A extends { _tag: string }>(a: A) =>
//   <K extends keyof A['_tag']>(tag: K) =>
//     tag === a._type ? O.some(a as any as A[K]) : O.none

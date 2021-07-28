import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { Functor2 } from 'fp-ts/lib/Functor'
import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'
import { Monad2 } from 'fp-ts/lib/Monad'

export const URI = 'StoreIO' as const
export type URI = typeof URI

export interface StoreIO<A, B> {
  _tag: typeof URI
  value: Map<A, B>
}

export const make = <A, B>(): StoreIO<A, B> => ({
  _tag: 'StoreIO',
  value: new Map<A, B>(),
})

export const write =
  <A, B>(key: A, value: B, store: StoreIO<A, B>): IO.IO<B> =>
  () => {
    store.value.set(key, value)
    return value
  }

export class NotFoundError extends Error {}
export type ReadError = NotFoundError

export const read =
  <A, B>(key: A, store: StoreIO<A, B>): IOE.IOEither<ReadError, B> =>
  () => {
    const value = store.value.get(key)
    return value === null || value === undefined
      ? E.left(new NotFoundError(`Can't read ${key} from store`))
      : E.right(value)
  }

export type RemoveError = NotFoundError
export const remove = <A, B>(
  key: A,
  store: StoreIO<A, B>,
): IOE.IOEither<RemoveError, B> =>
  pipe(
    read(key, store),
    IOE.map((value) => {
      store.value.delete(key)
      return value
    }),
  )

export const map =
  <E, A, B>(f: (a: A, e: E) => B) =>
  (fa: StoreIO<E, A>): StoreIO<E, B> => {
    const newStore = make<E, B>()
    for (const [e, a] of fa.value.entries()) {
      newStore.value.set(e, f(a, e))
    }
    return newStore
  }

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: StoreIO<E, A>
  }
}

const _map: Monad2<URI>['map'] = (fa, f) => pipe(fa, map(f))

export const Functor: Functor2<URI> = {
  URI,
  map: _map,
}

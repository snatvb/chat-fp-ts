import { Chain2 } from 'fp-ts/lib/Chain'
import { Eq, fromEquals } from 'fp-ts/lib/Eq'
import { pipe } from 'fp-ts/lib/function'
import { Functor2 } from 'fp-ts/lib/Functor'
import { URItoKind2 } from 'fp-ts/lib/HKT'
import * as _ from 'fp-ts/lib/internal'
import { Monad2 } from 'fp-ts/lib/Monad'
import { Prism } from 'monocle-ts'

export type Success<A> = {
  readonly _tag: 'Success'
  readonly value0: A
}

export type Failure<B> = {
  readonly _tag: 'Failure'
  readonly value0: B
}

export type Pending = {
  readonly _tag: 'Pending'
}

export type Loading<A, B> = Pending | Success<A> | Failure<B>

export const pending: Loading<never, never> = { _tag: 'Pending' }

export function success<A, B>(value0: A): Loading<A, B> {
  return { _tag: 'Success', value0 }
}

export function failure<A, B>(value0: B): Loading<A, B> {
  return { _tag: 'Failure', value0 }
}

export function fold<A, B, R>(
  onPending: () => R,
  onSuccess: (value0: A) => R,
  onFailure: (value0: B) => R,
): (fa: Loading<A, B>) => R {
  return (fa) => {
    switch (fa._tag) {
      case 'Pending':
        return onPending()
      case 'Success':
        return onSuccess(fa.value0)
      case 'Failure':
        return onFailure(fa.value0)
    }
  }
}

export function _pending<A, B>(): Prism<Loading<A, B>, Loading<A, B>> {
  return Prism.fromPredicate((s) => s._tag === 'Pending')
}

export function _success<A, B>(): Prism<Loading<A, B>, Loading<A, B>> {
  return Prism.fromPredicate((s) => s._tag === 'Success')
}

export function _failure<A, B>(): Prism<Loading<A, B>, Loading<A, B>> {
  return Prism.fromPredicate((s) => s._tag === 'Failure')
}

export function getEq<A, B>(
  eqSuccessValue0: Eq<A>,
  eqFailureValue0: Eq<B>,
): Eq<Loading<A, B>> {
  return fromEquals((x, y) => {
    if (x._tag === 'Pending' && y._tag === 'Pending') {
      return true
    }
    if (x._tag === 'Success' && y._tag === 'Success') {
      return eqSuccessValue0.equals(x.value0, y.value0)
    }
    if (x._tag === 'Failure' && y._tag === 'Failure') {
      return eqFailureValue0.equals(x.value0, y.value0)
    }
    return false
  })
}

export const URI = 'Loading'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly Loading: Loading<A, E>
  }
}

export const isSuccess = <A>(ma: Loading<A, unknown>): ma is Success<A> =>
  ma._tag === 'Success'

export const map =
  <B, A>(f: (a: A) => B) =>
  <E>(fa: Loading<A, E>): Loading<B, E> =>
    fa._tag === 'Success' ? success(f(fa.value0)) : fa

export const mapFailure =
  <B, E>(f: (a: E) => B) =>
  <A>(fa: Loading<A, E>): Loading<A, B> =>
    fa._tag === 'Failure' ? failure(f(fa.value0)) : fa

export const chainW =
  <E2, A, B>(f: (a: A) => Loading<B, E2>) =>
  <E1>(ma: Loading<A, E2>): Loading<B, E1 | E2> =>
    ma._tag === 'Success' ? f(ma.value0) : ma

export const chain: <E, A, B>(
  f: (a: A) => Loading<B, E>,
) => (ma: Loading<A, E>) => Loading<B, E> = chainW

export const apW: <E2, A>(
  fa: Loading<A, E2>,
) => <E1, B>(fab: Loading<(a: A) => B, E1>) => Loading<B, E1 | E2> =
  (fa) => (fab) =>
    isSuccess(fab) ? (isSuccess(fa) ? success(fab.value0(fa.value0)) : fa) : fab

export const ap: <A, B>(
  fa: Loading<A, B>,
) => <C>(fab: Loading<(a: A) => C, B>) => Loading<C, B> = apW

const _map: Functor2<URI>['map'] = (fa, f) => pipe(fa, map(f))
const _chain: Monad2<URI>['chain'] = (ma, f) => pipe(ma, chain(f))
const _ap: Monad2<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa))

export const Functor: Functor2<URI> = {
  URI,
  map: _map,
}

export const Chain: Chain2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
}

import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'

export const prop =
  <T, K extends keyof T>(key: K) =>
  (obj: T) =>
    obj[key]

export const True = () => true
export const False = () => false

export const ioToIOE =
  <E>() =>
  <A>(io: IO.IO<A>): IOE.IOEither<E, A> =>
    IO.chain((x: A) => IOE.of<E, A>(x))(io)

// export enum LoadingState {
//   Pending = 'pending',
//   Failure = 'failure',
// }

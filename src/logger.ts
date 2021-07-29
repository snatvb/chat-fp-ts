import * as Console from 'fp-ts/lib/Console'
import * as IO from 'fp-ts/lib/IO'

export const { log, warn, error, info } = Console

export const visitor =
  <A>(f: (a: A) => IO.IO<void>) =>
  (a: A): IO.IO<A> =>
  () => {
    f(a)()
    return a
  }

export const visit = visitor(log)
export const inspect = <A>(summary: string) =>
  visitor((a: A) => log([summary, a]))

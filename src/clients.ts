import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'
import * as O from 'fp-ts/lib/Option'

import * as SIO from './StoreIO'
import * as uuid from './uuid'

export interface Client {
  on(event: 'message', f: OnMessage): void
  on(event: 'close', f: OnClose): void
}

const LIVE_CLIENTS: SIO.StoreIO<string, Client> = SIO.make()

export type OnMessage = (message: string) => void
export type OnClose = () => void

export interface Listeners {
  message: OnMessage[]
  close: OnClose[]
}

export const attachListeners =
  (client: Client, listeners: Partial<Listeners>): IO.IO<Client> =>
  () => {
    listeners.message?.forEach((listener) => client.on('message', listener))
    listeners.close?.forEach((listener) => client.on('close', listener))
    return client
  }

export const save = (client: Client) =>
  pipe(
    uuid.generate(),
    IO.chain((id) =>
      pipe(
        SIO.write(id, client, LIVE_CLIENTS),
        IO.map(() => [id, client] as const),
      ),
    ),
  )

export const remove = (id: string) => SIO.remove(id, LIVE_CLIENTS)
export const get = (id: string) => SIO.read(id, LIVE_CLIENTS)

// export const save = (client: Client) =>
//   pipe(
//     uuid.generate(),
//     IO.map((id) => {
//       LIVE_CLIENTS.set(id, client)
//       return [id, client] as const
//     })
//   )

// export const remove =
//   (id: string): IO.IO<E.Either<Error, void>> =>
//   () =>
//     LIVE_CLIENTS.delete(id)
//       ? E.right(void 0)
//       : E.left(new Error(`Client not found by ${id} id.`))

// export const get =
//   (id: string): IO.IO<O.Option<Client>> =>
//   () =>
//     O.fromNullable(LIVE_CLIENTS.get(id))

import * as DATE from 'fp-ts/lib/Date'
import { flow, pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'

import * as PKT from './packet'
import * as SIO from './StoreIO'
import * as uuid from './uuid'

export interface WSClient {
  on(event: 'message', f: OnMessage): void
  on(event: 'close', f: OnClose): void
  send(data: string): void
}
export type Client = {
  socket: WSClient
  id: string
}

const LIVE_CLIENTS: SIO.StoreIO<string, Client> = SIO.make()

export type OnMessage = (message: string) => void
export type OnClose = () => void

export interface Listeners {
  message: OnMessage[]
  close: OnClose[]
}

export const make = (wsClient: WSClient): IO.IO<Client> =>
  pipe(
    wsClient,
    IO.of,
    IO.bindTo('socket'),
    IO.bind('id', () => uuid.generate()),
  )

export const attachListeners =
  (client: Client, listeners: Partial<Listeners>): IO.IO<Client> =>
  () => {
    listeners.message?.forEach((listener) =>
      client.socket.on('message', listener),
    )
    listeners.close?.forEach((listener) => client.socket.on('close', listener))
    return client
  }

export const save = (client: Client) =>
  SIO.write(client.id, client, LIVE_CLIENTS)
export const remove = (id: string) => SIO.remove(id, LIVE_CLIENTS)
export const get = (id: string) => SIO.read(id, LIVE_CLIENTS)

export const sendPKT =
  (client: Client) =>
  (pkt: PKT.Packet): IO.IO<Client> =>
  () => {
    client.socket.send(JSON.stringify(pkt))
    return client
  }

export const sendTo =
  (id: string) =>
  (packet: PKT.Packet): IOE.IOEither<Error, Client> =>
    pipe(
      id,
      get,
      IOE.chain(
        flow(
          (client) => sendPKT(client)(packet),
          (io): IOE.IOEither<Error, Client> => IOE.fromIO(io),
        ),
      ),
    )

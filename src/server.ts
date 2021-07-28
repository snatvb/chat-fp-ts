import * as Console from 'fp-ts/lib/Console'
import * as E from 'fp-ts/lib/Either'
import { flow, pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'

import * as Chat from './chat'
import * as Clients from './clients'
import * as MSG from './message'
import * as PKT from './packet'
import { ElementArrayOf } from './types'
import * as WS from './ws'

type Client = Clients.Client

const pingToJson = (packet: string) =>
  packet === 'ping' ? `{ "type": "ping" }` : packet

const decodePacket = flow(pingToJson, PKT.parse)

const applyPackage =
  ([clientId, client]: [string, Client]) =>
  (packet: PKT.Packet): IOE.IOEither<Error, any> => {
    switch (packet.type) {
      case 'ping':
        return IOE.right(void 0)
      case 'create_chat':
        return pipe(
          Chat.make(packet.payload.title, clientId),
          IO.chain(Chat.save),
          IOE.fromIO,
          IOE.mapLeft((e) => e as Error),
        )
      case 'message':
        return pipe(
          MSG.make(packet.payload),
          IO.chain(MSG.save),
          IOE.fromIO,
          IOE.mapLeft((e) => e as Error),
        )
      case 'pong':
        return IOE.left(new Error(`Client ${clientId} sent pong.`))
    }
  }

const handlePackage =
  ([clientId, client]: [string, Client]) =>
  (packet: string) =>
    pipe(
      packet,
      decodePacket,
      IOE.fromEither,
      IOE.chainW(applyPackage([clientId, client])),
      IOE.orLeft(Console.error),
    )()

const handleCloseConnection = ([clientId]: [string, Client]) =>
  pipe(
    clientId,
    Clients.remove,
    IO.chain(
      flow(
        E.map(() => `Client ${clientId} disconnected`),
        E.fold(Console.log, Console.error),
      ),
    ),
  )

export type Listeners = {
  [K in keyof Clients.Listeners]: Array<
    (clientConfig: [string, Client]) => ElementArrayOf<Clients.Listeners[K]>
  >
}

const handleConnection = (listeners: Partial<Listeners>) => (client: Client) =>
  pipe(
    client,
    Clients.save,
    IO.chain(([id, client]) =>
      Clients.attachListeners(client, {
        message: listeners.message?.map((handler) => handler([id, client])),
        close: listeners.close?.map((handler) => handler([id, client])),
      }),
    ),
    IO.chain(() => Console.log(`Client connected`)),
  )()

WS.run({
  listeners: {
    connection: [
      handleConnection({
        message: [handlePackage],
        close: [handleCloseConnection],
      }),
    ],
  },
  serverOptions: { port: 8080 },
})()

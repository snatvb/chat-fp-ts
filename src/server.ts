import * as Console from 'fp-ts/lib/Console'
import * as E from 'fp-ts/lib/Either'
import { flow, pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'

import * as Chat from './chat'
import * as C from './client'
import * as MSG from './message'
import * as PKT from './packet'
import { ElementArrayOf } from './types'
import * as WS from './ws'

type Client = C.Client

const pingToJson = (packet: string) =>
  packet === 'ping' ? `{ "type": "ping" }` : packet

const decodePacket = flow(pingToJson, PKT.parse)

const applyPackage =
  (client: Client) =>
  (packet: PKT.Packet): IOE.IOEither<Error, any> => {
    switch (packet.type) {
      case 'ping':
        return IOE.right(void 0)
      case 'create_chat':
        return pipe(
          Chat.make(packet.payload.title, client.id),
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
        return IOE.left(new Error(`Client ${client.id} sent pong.`))
    }
  }

const handlePackage = (client: Client) => (packet: string) =>
  pipe(
    packet,
    decodePacket,
    IOE.fromEither,
    IOE.chainW(applyPackage(client)),
    IOE.orLeft(Console.error),
  )()

const handleCloseConnection = (client: Client) =>
  pipe(
    client.id,
    C.remove,
    IO.chain(
      flow(
        E.map(() => `Client ${client.id} disconnected`),
        E.fold(Console.log, Console.error),
      ),
    ),
  )

export type Listeners = {
  [K in keyof C.Listeners]: Array<
    (client: Client) => ElementArrayOf<C.Listeners[K]>
  >
}

const handleConnection =
  (listeners: Partial<Listeners>) => (client: C.WSClient) =>
    pipe(
      client,
      C.make,
      IO.chain(C.save),
      IO.chain((client) =>
        C.attachListeners(client, {
          message: listeners.message?.map((handler) => handler(client)),
          close: listeners.close?.map((handler) => handler(client)),
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

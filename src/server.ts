import * as Console from 'fp-ts/lib/Console'
import * as E from 'fp-ts/lib/Either'
import { flow, pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'
import * as H from 'shared/helpers'
import * as PKT from 'shared/Packet'

import * as Chat from './chat'
import * as C from './client'
import * as Logger from './logger'
import * as MSG from './message'
import { ElementArrayOf } from './types'
import * as WS from './ws'

type Client = C.Client

export const pingToJson = (packet: string) =>
  packet === 'ping' ? `{ "type": "ping" }` : packet

export const decodePacket = flow(pingToJson, PKT.parse)

export const handleSaveMessage = flow(
  MSG.make,
  IO.chain(MSG.save),
  IO.chain(Logger.inspect('Received message')),
)

export const saveMsgInChat = (msg: MSG.Message) =>
  pipe(
    Chat.get(msg.chatId),
    IOE.chain(flow(Chat.saveMessageId(msg.id), H.ioToIOE<Error>())),
    IOE.bindTo('chat'),
    IOE.map((res) => ({ ...res, message: msg })),
  )

const applyPackage =
  (client: Client) =>
  (packet: PKT.Packet): IOE.IOEither<Error, void> => {
    switch (packet.type) {
      case 'ping':
        return IOE.right<Error, void>(void 0)

      case 'create_chat':
        return pipe(
          Chat.make(packet.payload.title, client.id),
          IO.chain(Chat.save),
          IO.chain(Logger.inspect('Chat created')),
          IO.chain(() => IOE.right<Error, void>(void 0)),
        )

      case 'message':
        return pipe(
          packet.payload,
          handleSaveMessage,
          IO.chain(saveMsgInChat),
          IO.chain(Logger.inspect('Added message to chat')),
          IOE.chain(({ chat, message }) =>
            pipe(message, Chat.sendMsgOut(chat), H.ioToIOE<Error>()),
          ),
          IOE.map(Logger.inspect('Sent out message')),
          IOE.map(() => void 0),
        )

      default:
        return IOE.left<Error, void>(
          new Error(`Client sent ${client.id} unknown package.`),
        )
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
      IO.map((client) => {
        setTimeout(() => client.socket.send('hi'), 200) // FIXME: DELETE
        return client
      }),
      IO.chain(C.save),
      IO.chain((client) =>
        C.attachListeners(client, {
          message: listeners.message?.map((handler) => handler(client)),
          close: listeners.close?.map((handler) => handler(client)),
        }),
      ),
      IO.chain((client) => Console.log(`Client ${client.id} connected`)),
    )()

const config: WS.WSConfig = {
  listeners: {
    connection: [
      handleConnection({
        message: [handlePackage],
        close: [handleCloseConnection],
      }),
    ],
  },
  serverOptions: { port: 8080 },
}
const run = WS.create(config)

run()

import { flow, pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'
import * as H from 'shared/helpers'
import * as PKT from 'shared/Packet'

import * as Chat from './chat'
import * as C from './client'
import * as Logger from './logger'
import * as MSG from './message'

export type Handler<A extends PKT.PacketMessage> = (
  client: C.Client,
  pktMsg: A,
  messageId: number,
) => IOE.IOEither<Error, void>

export const requestCreateChat: Handler<PKT.RequestCreateChat> = (
  client,
  pktMsg,
) =>
  pipe(
    Chat.make(pktMsg.payload.title, client.id),
    IO.chain(Chat.save),
    IO.chain(Logger.inspect('Chat created')),
    IO.chain(() => IOE.right<Error, void>(void 0)),
    // TODO: Add response
  )

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

export const sendMessage: Handler<PKT.SendMessage> = (client, pktMsg) =>
  pipe(
    pktMsg.payload,
    handleSaveMessage,
    IO.chain(saveMsgInChat),
    IO.chain(Logger.inspect('Added message to chat')),
    IOE.chain(({ chat, message }) =>
      pipe(message, Chat.sendMsgOut(chat), H.ioToIOE<Error>()),
    ),
    IOE.map(Logger.inspect('Sent out message')),
    IOE.map(() => void 0),
  )

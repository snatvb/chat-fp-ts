import * as A from 'fp-ts/lib/Array'
import * as DATE from 'fp-ts/lib/Date'
import { flow, pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'
import { Lens } from 'monocle-ts'

import * as C from './client'
import * as H from './helpers'
import * as MSG from './message'
import * as PKT from './packet'
import * as SIO from './StoreIO'
import * as uuid from './uuid'

export type Chat = {
  id: string
  ownerId: string
  title: string
  createAt: number
  members: string[]
  messages: string[] // ids only
}

export const LIVE_CHATS = SIO.make<string, Chat>()

export const make = (title: string, ownerId: string): IO.IO<Chat> =>
  pipe(
    uuid.generate(),
    IO.bindTo('id'),
    IO.bind('createAt', () => DATE.now),
    IO.map(({ id, createAt }) => ({
      id,
      title,
      ownerId,
      createAt,
      members: [],
      messages: [],
    })),
  )

export const save = (chat: Chat) => SIO.write(chat.id, chat, LIVE_CHATS)
export const get = (id: string) => SIO.read(id, LIVE_CHATS)
export const remove = (id: string) => SIO.remove(id, LIVE_CHATS)

const messages = Lens.fromProp<Chat>()('messages')
export const addMessageId =
  (msgId: string) =>
  (chat: Chat): Chat =>
    pipe(chat, messages.modify(A.append(msgId)))

export const saveMessageIdByChatId = (msgId: string) =>
  flow(
    get,
    IOE.map(addMessageId(msgId)),
    IOE.chain(flow(save, H.ioToIOE<Error>())),
  )

export const saveMessageId = (msgId: string) => flow(addMessageId(msgId), save)

const msgToPkt = (msg: MSG.Message): PKT.Packet => ({
  type: 'received_message',
  payload: msg,
})

export const sendMsgOut = (chat: Chat) => (msg: MSG.Message) =>
  pipe(
    chat.members,
    A.map(C.get),
    IO.traverseArray(
      IOE.chain(
        (client) =>
          pipe(msg, msgToPkt, C.sendPKT(client), IOE.fromIO) as IOE.IOEither<
            SIO.NotFoundError,
            C.Client
          >,
      ),
    ),
  )

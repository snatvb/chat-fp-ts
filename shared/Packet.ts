import * as E from 'fp-ts/lib/Either'
import { flow, pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as J from 'fp-ts/lib/Json'
import * as t from 'io-ts'

export const ping = t.type({
  type: t.literal('ping'),
})

export const pong = t.type({
  type: t.literal('pong'),
})

export const sendMessage = t.type({
  type: t.literal('send_message'),
  payload: t.type({
    chatId: t.string,
    text: t.string,
    senderId: t.string,
  }),
})

export const receivedMessage = t.type({
  type: t.literal('received_message'),
  payload: t.type({
    id: t.string,
    text: t.string,
    ownerId: t.string,
    chatId: t.string,
    timestamp: t.number,
  }),
})

export const chat = t.type({
  id: t.string,
  ownerId: t.string,
  title: t.string,
  createAt: t.number,
  members: t.array(t.string),
  messages: t.array(t.string),
})

export const requestCreateChat = t.type({
  type: t.literal('request_create_chat'),
  payload: t.type({
    title: t.string,
  }),
})

export const responseChatCreated = t.type({
  type: t.literal('response_chat_created'),
  payload: t.type({
    title: t.string,
  }),
})

export const user = t.type({
  id: t.string,
  displayName: t.string,
  username: t.string,
  avatar: t.union([t.string, t.undefined]),
})

export const requestUser = t.type({
  type: t.literal('request_user'),
  payload: t.type({ id: t.string }),
})

export const responseUser = t.type({
  type: t.literal('response_user'),
  payload: user,
})

export const findUser = t.type({
  type: t.literal('response_user'),
  payload: t.type({
    username: t.string,
  }),
})

export const packetMessage = t.union([
  ping,
  pong,
  findUser,
  requestUser,
  responseUser,
  sendMessage,
  requestCreateChat,
  receivedMessage,
])

export const packet = t.type({
  id: t.number,
  payload: packetMessage,
})

export type Ping = t.TypeOf<typeof ping>
export type Pong = t.TypeOf<typeof pong>

export type Chat = t.TypeOf<typeof chat>
export type User = t.TypeOf<typeof user>
export type Message = t.TypeOf<typeof sendMessage>

export type ReceivedMessage = t.TypeOf<typeof receivedMessage>

export type PacketMessage = t.TypeOf<typeof packetMessage>
export type Packet = t.TypeOf<typeof packet>

export const parse = flow(
  J.parse as (s: string) => E.Either<Error, J.Json>,
  E.chainW(packet.decode),
)

export const createPack =
  (getId: IO.IO<number>) =>
  (pktMsg: PacketMessage): IO.IO<Packet> =>
    pipe(
      getId,
      IO.map((id) => ({ id, payload: pktMsg })),
    )

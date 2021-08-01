import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import * as J from 'fp-ts/lib/Json'
import * as t from 'io-ts'

export const ping = t.type({
  type: t.literal('ping'),
})

export const pong = t.type({
  type: t.literal('pong'),
})

export const message = t.type({
  type: t.literal('message'),
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

export const createChat = t.type({
  type: t.literal('create_chat'),
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

export const packet = t.union([
  ping,
  pong,
  findUser,
  requestUser,
  responseUser,
  message,
  createChat,
  receivedMessage,
])

export type Ping = t.TypeOf<typeof ping>
export type Pong = t.TypeOf<typeof pong>

export type User = t.TypeOf<typeof user>
export type Message = t.TypeOf<typeof message>
export type ReceivedMessage = t.TypeOf<typeof receivedMessage>

export type Packet = t.TypeOf<typeof packet>

export const parse = flow(
  J.parse as (s: string) => E.Either<Error, J.Json>,
  E.chainW(packet.decode),
)

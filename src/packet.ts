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

export const messagePayload = t.type({
  chatId: t.string,
  text: t.string,
  senderId: t.string,
})

export const message = t.type({
  type: t.literal('message'),
  payload: messagePayload,
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

export const packet = t.union([
  ping,
  pong,
  message,
  createChat,
  receivedMessage,
])

export type Ping = t.TypeOf<typeof ping>
export type Pong = t.TypeOf<typeof pong>

export type MessagePayload = t.TypeOf<typeof messagePayload>
export type Message = t.TypeOf<typeof message>
export type ReceivedMessage = t.TypeOf<typeof receivedMessage>

export type Packet = t.TypeOf<typeof packet>

export const parse = flow(
  J.parse as (s: string) => E.Either<Error, unknown>,
  E.chainW(packet.decode),
)

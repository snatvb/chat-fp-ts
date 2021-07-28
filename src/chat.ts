import * as DATE from 'fp-ts/lib/Date'
import { pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'

import * as MSG from './message'
import * as SIO from './StoreIO'
import * as uuid from './uuid'

export type Chat = {
  id: string
  ownerId: string
  title: string
  createAt: number
  messages: MSG.Message[]
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
      messages: [],
    })),
  )

export const save = (chat: Chat) => SIO.write(chat.id, chat, LIVE_CHATS)
export const get = (id: string) => SIO.read(id, LIVE_CHATS)
export const remove = (id: string) => SIO.remove(id, LIVE_CHATS)

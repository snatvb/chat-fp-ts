import { pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'

import * as MSG from './message'
import * as PKT from './packet'
import * as SIO from './StoreIO'
import * as uuid from './uuid'

export type Message = PKT.ReceivedMessage['payload']

class ErrorWrongJSON extends Error {}

export type ErrorParse = ErrorWrongJSON

export const parse = (msg: string): IOE.IOEither<ErrorParse, Message> => {
  try {
    const parsedMessage = JSON.parse(msg)
    return IOE.right<ErrorParse, Message>(parsedMessage)
  } catch (e) {
    return IOE.left<ErrorParse, Message>(new ErrorWrongJSON('Incorrect JSON'))
  }
}

export type Messages = SIO.StoreIO<string, MSG.Message>

const MESSAGES: Messages = SIO.make()

export const make = (msg: PKT.MessagePayload): IO.IO<MSG.Message> =>
  pipe(
    uuid.generate(),
    IO.map((id) => ({
      id,
      chatId: msg.chatId,
      timestamp: Date.now(),
      text: msg.text,
      ownerId: msg.senderId,
    })),
  )

export const save = (msg: MSG.Message) => SIO.write(msg.id, msg, MESSAGES)
export const get = (id: string) => SIO.read(id, MESSAGES)
export const remove = (id: string) => SIO.remove(id, MESSAGES)

import * as Logger from 'fp-ts/lib/Console'
import { now } from 'fp-ts/lib/Date'
import * as E from 'fp-ts/lib/Either'
import { apply, Lazy, pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import {
  capDelay,
  exponentialBackoff,
  limitRetries,
  Monoid,
  RetryPolicy,
  RetryStatus,
} from 'retry-ts'
import { retrying } from 'retry-ts/lib/Task'
import * as PKT from 'shared/Packet'
import * as UniqId from 'shared/UniqId'
import * as H from '~/helpers'

const id = UniqId.createUniqId(2)
export const getMessageId = id()
export const pack = PKT.createPack(getMessageId)

export class ServerUnreachedError extends Error {}
export class TimeoutConnectionError extends Error {}

export type ConnectionError = ServerUnreachedError | TimeoutConnectionError

export type OnClose = (event: CloseEvent) => void
export type OnError = (event: Event) => void
export type OnMessage = (event: MessageEvent) => void
export type OnOpen = (event: Event) => void

export enum ConnectionStatus {
  Open = 'Open',
  Closed = 'Closed',
  Closing = 'Closing',
  Connecting = 'Connecting',
}

export interface EventListeners {
  open: OnOpen[]
  close: OnClose[]
  error: OnError[]
  message: OnMessage[]
}

export const DEFAULT_EVENT_LISTENERS: EventListeners = {
  open: [],
  close: [],
  error: [],
  message: [],
}

export interface Config<WS extends typeof WebSocket> {
  webSocketConstructor: WS
  endpoint: string
  connectionTimeout?: number
  retryPolicy?: RetryPolicy
  protocols?: string | []
  eventListeners?: Partial<EventListeners>
  connectionParams?: any | Lazy<any>
}

export const DEFAULT_CONNECTION_TIMEOUT = 5000

export const DEFAULT_RETRY_POLICY = capDelay(
  DEFAULT_CONNECTION_TIMEOUT,
  Monoid.concat(exponentialBackoff(200), limitRetries(Infinity)),
)

export const attachListeners =
  (listeners: Partial<EventListeners>) =>
  (ws: WebSocket): IO.IO<WebSocket> =>
  () => {
    for (const [key, listenersByName] of Object.entries(listeners)) {
      listenersByName.forEach((listener) =>
        ws.addEventListener(key as keyof EventListeners, listener as any),
      )
    }
    return ws
  }

export const tryConnection =
  (timeoutTime: number) =>
  (ws: WebSocket): TE.TaskEither<ConnectionError, WebSocket> =>
  () =>
    new Promise((resolve) => {
      const timeout = H.timeout.make(timeoutTime)
      const stopTimeout = H.timeout.fork(() => {})(() =>
        resolve(
          E.left(new TimeoutConnectionError(`[${now()}] Connection timeout`)),
        ),
      )(timeout)
      ws.addEventListener('open', () => {
        stopTimeout()
        resolve(E.right(ws))
      })
      ws.addEventListener('error', (error) => {
        stopTimeout()
        resolve(
          E.left(
            new ServerUnreachedError(`[${error.timeStamp}] Connection fault`),
          ),
        )
      })
    })

export const make = <A extends typeof WebSocket>(
  config: Config<A>,
): TE.TaskEither<ConnectionError, WebSocket> => {
  return pipe(
    () => new config.webSocketConstructor(config.endpoint, config.protocols),
    IO.chain(
      attachListeners({
        ...DEFAULT_EVENT_LISTENERS,
        ...config.eventListeners,
        close: [],
      }),
    ),
    IO.chain(
      tryConnection(config.connectionTimeout ?? DEFAULT_CONNECTION_TIMEOUT),
    ),
    TE.chain((ws) =>
      pipe(
        {
          close: [
            ...DEFAULT_EVENT_LISTENERS.close,
            ...(config.eventListeners?.close ?? []),
          ],
        },
        attachListeners,
        apply(ws),
        (x) => TE.rightIO<ConnectionError, WebSocket>(x),
      ),
    ),
  )
}

const logDelay = (status: RetryStatus) =>
  TE.rightIO(
    Logger.log(
      pipe(
        status.previousDelay,
        O.map((delay) => `Retrying connection in ${delay} milliseconds...`),
        O.getOrElse(() => 'Connecting...'),
      ),
    ),
  )

export const makeWithReconnection = <A extends typeof WebSocket>(
  config: Config<A>,
): TE.TaskEither<ConnectionError, WebSocket> =>
  retrying(
    config.retryPolicy ?? DEFAULT_RETRY_POLICY,
    (status) =>
      pipe(
        logDelay(status),
        TE.chain(() => make(config)),
      ),
    E.isLeft,
  )

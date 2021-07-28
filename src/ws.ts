import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as O from 'fp-ts/lib/Option'
import * as R from 'fp-ts/lib/Reader'
import * as T from 'fp-ts/lib/Task'
import { Agent, ClientRequest, ClientRequestArgs, IncomingMessage, OutgoingHttpHeaders } from 'http'
import WebSocket, { ServerOptions } from 'ws'

export type Client = WebSocket

export enum ConnectionState {
  Connecting = WebSocket.CONNECTING,
  Open = WebSocket.OPEN,
  Closing = WebSocket.CLOSING,
  Closed = WebSocket.CLOSED,
}

export type OnClose = () => void
export type OnError = (error: Error) => void
export type OnConnection = (client: Client, request: IncomingMessage) => void

export interface WebSocketEventListeners {
  close: Array<() => void>
  error: Array<(error: Error) => void>
  connection: Array<OnConnection>
}

export interface WSConfig {
  listeners: Partial<WebSocketEventListeners>
  serverOptions?: ServerOptions
}

interface Server {
  on(event: 'connection', f: OnConnection): void
  on(event: 'error', f: OnError): void
  on(event: 'close', f: OnClose): void
}

export const createServer = (options: ServerOptions) =>
  IO.of(() => {
    console.log(`WebSocket running on ${options?.port}`)
    return new WebSocket.Server(options)
  })

export const attachListeners =
  (ws: Server, listeners: WSConfig['listeners']): IO.IO<Server> =>
  () => {
    listeners.connection?.forEach((listener) => ws.on('connection', listener))
    listeners.error?.forEach((listener) => ws.on('error', listener))
    listeners.close?.forEach((listener) => ws.on('close', listener))
    return ws
  }

export const run = (config: WSConfig) =>
  pipe(
    config.serverOptions,
    createServer,
    IO.chain((ws) => attachListeners(ws(), config.listeners))
  )

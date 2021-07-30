import * as Logger from 'fp-ts/lib/Console'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as IOE from 'fp-ts/lib/IOEither'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import { Middleware } from 'redux'
import * as PKT from 'shared/Packet'
import { getType } from 'typesafe-actions'
import actions, { Action } from '~/actions'
import * as WS from '~/lib/ws'
import { State } from '~/store'

const middleware: Middleware<{}, State> = (redux) => {
  const handleMessage = (event: MessageEvent) =>
    pipe(
      event.data,
      PKT.parse,
      E.map(actions.ws.received),
      E.map(redux.dispatch),
      IOE.fromEither,
      IOE.orLeft(Logger.warn),
    )

  const handleOpen = () =>
    pipe(
      WS.ConnectionStatus.Open,
      actions.ws.setConnectionStatus,
      redux.dispatch,
    )

  const setConnecting: IO.IO<void> = () =>
    pipe(
      WS.ConnectionStatus.Connecting,
      actions.ws.setConnectionStatus,
      redux.dispatch,
    )

  const config: WS.Config<typeof WebSocket> = {
    endpoint: process.env.ENDPOINT,
    webSocketConstructor: WebSocket,
    eventListeners: {
      open: [handleOpen],
      message: [handleMessage],
    },
  }

  let connection: O.Option<WebSocket> = O.none

  let saveConnection =
    (ws: WebSocket): IO.IO<WebSocket> =>
    () => {
      connection = O.some(ws)
      return ws
    }

  const connect = pipe(
    TE.rightIO(setConnecting),
    TE.chain(() => WS.makeWithReconnection(config)),
    TE.chain((ws) =>
      pipe(ws, saveConnection, (x) =>
        TE.rightIO<WS.ConnectionError, WebSocket>(x),
      ),
    ),
  )

  return (next) => async (action: Action) => {
    if (action.type === getType(actions.app.initialize)) {
      await connect()
    }
    return next(action)
  }
}

export default middleware

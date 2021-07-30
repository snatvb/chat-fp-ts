import { Middleware } from 'redux'
import * as WS from '~/lib/ws'

const middleware: Middleware = (redux) => {
  const wsRun = WS.makeWithReconnection({
    endpoint: process.env.ENDPOINT,
    webSocketConstructor: WebSocket,
    eventListeners: {
      open: [console.log],
    },
  })

  wsRun().then(console.log).catch(console.warn)

  return (next) => (action) => {
    return next(action)
  }
}

export default middleware

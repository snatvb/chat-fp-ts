import { Middleware } from 'redux'
import * as WS from '~/lib/ws'

const middleware: Middleware = (redux) => {
  const handleMessage = (event: MessageEvent) => {
    console.log(event.data)
  }

  const wsRun = WS.makeWithReconnection({
    endpoint: process.env.ENDPOINT,
    webSocketConstructor: WebSocket,
    eventListeners: {
      open: [console.log],
      message: [handleMessage],
    },
  })

  wsRun().then(console.log).catch(console.warn)

  return (next) => (action) => {
    return next(action)
  }
}

export default middleware
